// SalonEase Express App Configuration
// JWT-based authentication with JSON APIs

const express = require('express');
const path = require('path');
const { authenticateToken, requireRole } = require('./middleware/authMiddleware');
const { register, login } = require('./services/authService');

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Basic routes
app.get('/', (req, res) => {
    res.render('index', { title: 'SalonEase' });
});

// Auth page routes
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { title: 'Login - SalonEase' });
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { title: 'Register - SalonEase' });
});

// Auth API routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, gender } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
        });
    }

    const result = await register({ name, email, password, role, gender });

    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(400).json(result);
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    const result = await login(email, password);

    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});

// Export app for use in index.js
module.exports = app;
