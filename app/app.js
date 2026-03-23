// SalonEase Express App Configuration
// Main application setup and middleware configuration

const express = require('express');
const session = require('express-session');
const path = require('path');

// Import services and middleware
const AuthMiddleware = require('./middleware/authMiddleware');
const RoleMiddleware = require('./middleware/roleMiddleware');
const UserService = require('./services/userService');
const ServiceService = require('./services/serviceService');
const AppointmentService = require('./services/appointmentService');

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.messages = req.session.messages;
    delete req.session.messages;
    next();
});

// Public routes
app.get('/', (req, res) => {
    res.render('index', { title: 'SalonEase - Salon Appointment Management' });
});

// Authentication routes
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { title: 'Login - SalonEase' });
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await UserService.login(email, password);
        
        req.session.user = result.user;
        req.session.messages = { success: 'Login successful!' };
        
        res.redirect('/');
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/auth/login');
    }
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { title: 'Register - SalonEase' });
});

app.post('/auth/register', async (req, res) => {
    try {
        const userData = req.body;
        await UserService.register(userData);
        
        req.session.messages = { success: 'Registration successful! Please login.' };
        res.redirect('/auth/login');
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/auth/register');
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.session.messages = { error: 'Logout failed' };
        }
        res.redirect('/');
    });
});

// Protected routes
app.get('/services', async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();
        res.render('services/list', { 
            title: 'Services - SalonEase',
            services: services
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/');
    }
});

app.get('/my-appointments', AuthMiddleware.requireAuth, async (req, res) => {
    try {
        const appointments = await AppointmentService.getUserAppointments(req.user.id);
        res.render('appointments/list', { 
            title: 'My Appointments - SalonEase',
            appointments: appointments
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/');
    }
});

app.post('/appointments', AuthMiddleware.requireAuth, async (req, res) => {
    try {
        const appointmentData = {
            user_id: req.user.id,
            appointment_date: req.body.appointment_date,
            preferred_time: req.body.preferred_time,
            preferred_staff_gender: req.body.preferred_staff_gender
        };
        
        const selectedServices = JSON.parse(req.body.selectedServices || '[]');
        
        const result = await AppointmentService.createAppointmentWithServices(appointmentData, selectedServices);
        
        req.session.messages = { success: 'Appointment request submitted successfully!' };
        res.render('appointments/book', { 
            title: 'Booking Confirmed - SalonEase',
            bookingId: result.appointmentId
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/services');
    }
});

// Admin routes
app.get('/admin/dashboard', AuthMiddleware.requireAuth, RoleMiddleware.requireAdmin, async (req, res) => {
    try {
        // Get dashboard statistics
        const stats = {
            totalAppointments: 0, // Would be calculated from DB
            pendingAppointments: 0, // Would be calculated from DB
            totalUsers: 0, // Would be calculated from DB
            totalServices: (await ServiceService.getAllServices()).length
        };
        
        const recentAppointments = await AppointmentService.getAppointmentsByStatus('in_review');
        
        res.render('admin/dashboard', { 
            title: 'Admin Dashboard - SalonEase',
            stats: stats,
            recentAppointments: recentAppointments.slice(0, 5)
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/');
    }
});

app.get('/admin/appointments', AuthMiddleware.requireAuth, RoleMiddleware.requireAdmin, async (req, res) => {
    try {
        const status = req.query.status || 'all';
        const appointments = status === 'all' 
            ? await AppointmentService.getAppointmentsByStatus('in_review') // Would need to get all
            : await AppointmentService.getAppointmentsByStatus(status);
        
        res.render('admin/appointments', { 
            title: 'Manage Appointments - SalonEase',
            appointments: appointments
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/admin/dashboard');
    }
});

app.get('/admin/services', AuthMiddleware.requireAuth, RoleMiddleware.requireAdmin, async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();
        res.render('admin/services', { 
            title: 'Manage Services - SalonEase',
            services: services
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/admin/dashboard');
    }
});

app.get('/admin/staff', AuthMiddleware.requireAuth, RoleMiddleware.requireAdmin, async (req, res) => {
    try {
        const staff = await UserService.getStaff();
        res.render('admin/staff', { 
            title: 'Manage Staff - SalonEase',
            staff: staff
        });
    } catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/admin/dashboard');
    }
});

// Export app for use in index.js
module.exports = app;
