const express = require('express');
const path = require('path');
const { authenticateToken, requireType } = require('./middleware/authMiddleware');
const { registerCustomer, registerAdmin, login } = require('./services/authService');
const { getAllServices, getServicesByCategory, getServiceById } = require('./services/serviceService');
const { createAppointment } = require('./services/appointmentService');
const Appointment = require('./models/appointment');
const AppointmentServiceMap = require('./models/appointmentServiceMap');

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../static')));

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Home
app.get('/', (req, res) => {
    res.render('index', { title: 'SalonEase' });
});

// Auth pages
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { title: 'Login - SalonEase' });
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { title: 'Register - SalonEase' });
});

// Customer pages
app.get('/customer/services', (req, res) => {
    res.render('customer/services', { title: 'Services - SalonEase' });
});

app.get('/customer/book', (req, res) => {
    res.render('customer/book', { title: 'Book Appointment - SalonEase' });
});

app.get('/customer/appointments', (req, res) => {
    res.render('customer/appointments', { title: 'My Appointments - SalonEase' });
});

// Auth API
app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, gender } = req.body;
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const result = await registerCustomer({ name, email, phone, password, gender });
    res.status(result.success ? 201 : 400).json(result);
});

app.post('/api/auth/registerAdmin', authenticateToken, requireType(['admin']), async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const result = await registerAdmin({ name, email, phone, password });
    res.status(result.success ? 201 : 400).json(result);
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const result = await login(email, password);
    console.log('Login result:', result);
    res.status(result.success ? 200 : 401).json(result);
});

// Services API
app.get('/api/services', async (req, res) => {
    const result = await getAllServices();
    res.status(result.success ? 200 : 500).json(result);
});

app.get('/api/services/category/:category', async (req, res) => {
    const result = await getServicesByCategory(req.params.category);
    res.status(result.success ? 200 : 400).json(result);
});

app.get('/api/services/:id', async (req, res) => {
    const result = await getServiceById(req.params.id);
    res.status(result.success ? 200 : 404).json(result);
});

// Customer Booking API
app.post('/api/customer/appointments', authenticateToken, requireType(['customer']), async (req, res) => {
    const { appointment_date, preferred_time, preferred_staff_gender, services } = req.body;

    if (!appointment_date || !preferred_time || !services || services.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'appointment_date, preferred_time, and at least one service are required'
        });
    }

    const result = await createAppointment({
        customer_id: req.user.id,
        appointment_date,
        preferred_time,
        preferred_staff_gender: preferred_staff_gender || 'any',
        services
    });

    res.status(result.success ? 201 : 400).json(result);
});

// Customer Cancel Appointment API
app.put('/api/customer/appointments/:id/cancel', authenticateToken, requireType(['customer']), async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { cancellation_reason } = req.body;

        if (!cancellation_reason || cancellation_reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.customer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only cancel your own appointments' });
        }

        if (!['in_review', 'confirmed'].includes(appointment.status)) {
            return res.status(400).json({ success: false, message: 'This appointment cannot be cancelled' });
        }

        const updated = await Appointment.updateStatus(appointmentId, 'cancelled', {
            cancelled_by: req.user.id,
            cancellation_reason: cancellation_reason.trim()
        });

        if (updated) {
            res.json({ success: true, message: 'Appointment cancelled successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cancel appointment', error: error.message });
    }
});

// Customer Appointments API — fetch own appointments with services
app.get('/api/customer/appointments', authenticateToken, requireType(['customer']), async (req, res) => {
    try {
        const appointments = await Appointment.findByCustomerId(req.user.id);

        const appointmentsWithServices = await Promise.all(
            appointments.map(async (appt) => {
                const services = await AppointmentServiceMap.findByAppointmentId(appt.id);
                const estimatedTotal = await AppointmentServiceMap.getTotalPrice(appt.id);
                return { ...appt, services, estimated_total: estimatedTotal };
            })
        );

        res.json({ success: true, appointments: appointmentsWithServices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
    }
});

// Admin API routes
app.get('/api/admin/appointments', authenticateToken, requireType(['admin']), async (req, res) => {
    try {
        const db = require('./services/db');
        const [appointments] = await db.pool.execute(
            `SELECT a.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
             FROM appointments a
             JOIN customers c ON a.customer_id = c.id
             ORDER BY a.appointment_date DESC`
        );

        const appointmentsWithServices = await Promise.all(
            appointments.map(async (appt) => {
                const services = await AppointmentServiceMap.findByAppointmentId(appt.id);
                const estimatedTotal = await AppointmentServiceMap.getTotalPrice(appt.id);
                return { ...appt, services, estimated_total: estimatedTotal };
            })
        );

        res.json({ success: true, appointments: appointmentsWithServices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
    }
});

// Admin pages
app.get('/admin/appointments', (req, res) => {
    res.render('admin/appointments', { title: 'Appointments - SalonEase' });
});

app.get('/customer/cancel', (req, res) => {
    res.render('customer/cancel', { title: 'Cancel Appointment - SalonEase' });
});

module.exports = app;