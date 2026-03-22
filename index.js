// SalonEase Application Entry Point
// Main entry point for the SalonEase salon appointment management system

"use strict";

// Load environment variables
require('dotenv').config();

// Import the Express app configuration
const app = require("./app/app.js");

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 SalonEase server running at http://${HOST}:${PORT}/`);
    console.log(`📅 Salon Appointment Management System`);
    console.log(`🐳 Docker environment: ${process.env.NODE_ENV || 'development'}`);
});