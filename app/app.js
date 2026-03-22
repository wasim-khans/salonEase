// SalonEase Express App Configuration
// Main application setup and middleware configuration

const express = require('express');
const session = require('express-session');
const path = require('path');

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

// Basic routes (to be implemented)
app.get('/', (req, res) => {
    res.render('index', { title: 'SalonEase' });
});

// Auth routes
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { title: 'Login - SalonEase' });
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { title: 'Register - SalonEase' });
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard - SalonEase' });
});

app.get('/admin/appointments', (req, res) => {
    res.render('admin/appointments', { title: 'Manage Appointments - SalonEase' });
});

app.get('/admin/services', (req, res) => {
    res.render('admin/services', { title: 'Manage Services - SalonEase' });
});

app.get('/admin/staff', (req, res) => {
    res.render('admin/staff', { title: 'Manage Staff - SalonEase' });
});

// Appointment routes
app.get('/appointments/book', (req, res) => {
    res.render('appointments/book', { title: 'Book Appointment - SalonEase' });
});

app.get('/appointments', (req, res) => {
    res.render('appointments/list', { title: 'My Appointments - SalonEase' });
});

// Services routes
app.get('/services/list', (req, res) => {
    res.render('services/list', { title: 'Services - SalonEase' });
});

// Export app for use in index.js
module.exports = app;
