-- SalonEase Database Schema
-- Created for Salon Appointment Management System

-- Create database
CREATE DATABASE IF NOT EXISTS salonease_db;
USE salonease_db;

-- Users Table
-- Stores all system users: customers, admins, and staff
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'staff') NOT NULL,
    gender ENUM('male', 'female') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
-- Stores salon services offered
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('male', 'female', 'both') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
-- Stores booking information and lifecycle state
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    start_time TIME NULL,
    preferred_staff_gender ENUM('male', 'female', 'any') NOT NULL DEFAULT 'any',
    status ENUM('in_review', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'in_review',
    staff_id INT NULL,
    service_provided_by INT NULL,
    cancelled_by ENUM('customer', 'admin') NULL,
    cancellation_reason TEXT NULL,
    actual_price DECIMAL(10,2) NULL,
    admin_notes TEXT NULL,
    confirmed_at TIMESTAMP NULL,
    completed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (service_provided_by) REFERENCES users(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Appointment_Services Table
-- Maps multiple services to a single appointment
CREATE TABLE appointment_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL COMMENT 'Snapshot price at booking',
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Add indexes for better performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
