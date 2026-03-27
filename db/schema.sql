-- SalonEase Database Schema
-- Created for Salon Appointment Management System

-- Create database
CREATE DATABASE IF NOT EXISTS salonease_db;
USE salonease_db;

-- Customers Table
-- Stores customer information only
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins Table
-- Stores admin information only
CREATE TABLE admins (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff Table
-- Stores staff information (hairdressers, beauticians, etc.)
CREATE TABLE staff (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services Table
-- Stores salon services offered
CREATE TABLE services (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    category ENUM('male', 'female', 'both') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments Table
-- Stores booking information and lifecycle state
CREATE TABLE appointments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    start_time TIME NULL,
    preferred_staff_gender ENUM('male', 'female', 'any') NOT NULL DEFAULT 'any',
    status ENUM('in_review', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'in_review',
    staff_id CHAR(36) NULL COMMENT 'Staff member assigned to this appointment',
    cancelled_by ENUM('customer', 'admin') NULL,
    cancellation_reason TEXT NULL,
    actual_price DECIMAL(10,2) NULL,
    admin_notes TEXT NULL,
    confirmed_at TIMESTAMP NULL,
    completed_by CHAR(36) NULL COMMENT 'Staff member who marked appointment as complete',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (completed_by) REFERENCES staff(id)
);

-- Appointment_Services Table
-- Maps multiple services to a single appointment
CREATE TABLE appointment_services (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL COMMENT 'Snapshot price at booking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Add indexes for better performance
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_staff_email ON staff(email);
