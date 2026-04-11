const express = require('express');
const path = require('path');
const { authenticateToken, requireType } = require('./middleware/authMiddleware');
const { registerCustomer, registerAdmin, login } = require('./services/authService');
const { getAllServices, getServicesByCategory, getServiceById, createService, updateService, deleteService } = require('./services/serviceService');
const {
    createAppointment,
    editAppointment,
    cancelAppointment,
    getCustomerAppointments,
    getAllAppointments,
    confirmAppointment,
    completeAppointment
} = require('./services/appointmentService');
const { getAllStaff } = require('./services/staffService');

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
    const result = await cancelAppointment(req.params.id, 'customer', req.body.cancellation_reason, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
});

// Customer Edit Appointment API (only if in_review)
app.put('/api/customer/appointments/:id', authenticateToken, requireType(['customer']), async (req, res) => {
    const result = await editAppointment(req.params.id, req.user.id, req.body);
    res.status(result.success ? 200 : 400).json(result);
});

// Customer Appointments API — fetch own appointments with services
app.get('/api/customer/appointments', authenticateToken, requireType(['customer']), async (req, res) => {
    const result = await getCustomerAppointments(req.user.id);
    res.status(result.success ? 200 : 500).json(result);
});

// Admin API routes
app.get('/api/admin/appointments', authenticateToken, requireType(['admin']), async (req, res) => {
    const result = await getAllAppointments();
    res.status(result.success ? 200 : 500).json(result);
});

// Admin Staff API
app.get('/api/admin/staff', authenticateToken, requireType(['admin']), async (req, res) => {
    const result = await getAllStaff();
    res.status(result.success ? 200 : 500).json(result);
});

// Admin Confirm Appointment API (in_review → confirmed)
app.put('/api/admin/appointments/:id/confirm', authenticateToken, requireType(['admin']), async (req, res) => {
    const { staff_id, start_time } = req.body;
    const result = await confirmAppointment(req.params.id, staff_id, start_time);
    res.status(result.success ? 200 : 400).json(result);
});

// Admin Cancel Appointment API (any status except completed)
app.put('/api/admin/appointments/:id/cancel', authenticateToken, requireType(['admin']), async (req, res) => {
    const result = await cancelAppointment(req.params.id, 'admin', req.body.cancellation_reason);
    res.status(result.success ? 200 : 400).json(result);
});

// Admin Complete Appointment API (confirmed → completed)
app.put('/api/admin/appointments/:id/complete', authenticateToken, requireType(['admin']), async (req, res) => {
    const { actual_price, completed_by, admin_notes } = req.body;
    const result = await completeAppointment(req.params.id, actual_price, completed_by, admin_notes);
    res.status(result.success ? 200 : 400).json(result);
});

// Admin pages
app.get('/admin/appointments', (req, res) => {
    res.render('admin/appointments', { title: 'Appointments - SalonEase' });
});

module.exports = app;