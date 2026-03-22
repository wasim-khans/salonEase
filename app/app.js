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

// Export app for use in index.js
module.exports = app;
