const express = require('express');
const path = require('path');
const { authenticateToken, requireType } = require('./middleware/authMiddleware');
const { registerCustomer, registerAdmin, login } = require('./services/authService');

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

// Admin pages
app.get('/admin/appointments', authenticateToken, requireType(['admin']), (req, res) => {
    res.render('admin/appointments', { title: 'Appointments - SalonEase', user: req.user });
});

app.get('/customer/appointments', (req, res) => {
    res.render('customer/appointments', { title: 'My Appointments - SalonEase' });
});

app.get('/customer/cancel', (req, res) => {
    res.render('customer/cancel', { title: 'Cancel Appointment - SalonEase' });
});

module.exports = app;