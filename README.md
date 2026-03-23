# SalonEase - Salon Appointment Management System

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### Setup (2 commands)
```bash
# 1. Create environment file from template
cp .env.example .env

# 2. Start the application
docker-compose up -d
```

### 📱 Access Points
- **Application**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8081
  - Username: `root`
  - Password: Check your `.env` file

## 🛠️ Useful Commands
```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build

# Seed database with test data
npm run db:seed
```

## 📁 Project Structure
- `index.js` - Application entry point
- `app/` - Main application code
- `db/` - Database schema and utilities
- `static/` - CSS, images, client-side JS
- `.env` - Environment variables (create from `.env.example`)

## 🔐 Authentication System

### Secure User Management
- **Separate tables** for customers, admins, and staff (security-first design)
- **JWT-based authentication** with role-specific tokens
- **Role escalation prevention** - customers cannot become admins

### API Endpoints
- **Customer Registration**: `POST /api/auth/register`
  - Only creates customer accounts
  - Fields: `name`, `email`, `password`, `gender` (optional)
- **Admin Registration**: `POST /api/auth/register-admin`
  - Separate secure endpoint for admin creation
  - Fields: `name`, `email`, `password`
- **Universal Login**: `POST /api/auth/login`
  - Works for all user types automatically
  - Fields: `email`, `password`

### User Types
- **Customers**: Can book appointments, manage their bookings
- **Admins**: Full system access, manage appointments, create staff
- **Staff**: Created by admins, assigned to appointments (no login access)

## 🗄️ Database Schema

### Core Tables
- **customers** - Customer accounts and profiles
- **admins** - Administrator accounts
- **staff** - Staff members (hairdressers, beauticians)
- **services** - Salon services offered
- **appointments** - Booking management
- **appointment_services** - Service-to-appointment mapping

### Security Features
- **Isolated user tables** prevent cross-table attacks
- **Gender inclusivity**: `male`, `female`, `other`, `prefer_not_to_say`
- **Appointment statuses**: `in_review`, `confirmed`, `completed`, `cancelled`, `no_show`

### Database Setup
- MySQL 8.0 with Docker
- Automatic schema creation from `db/schema.sql`
- Persistent data storage with Docker volumes
- Migration scripts available in `db/`

---

This repository showcases lab work for the MSc in Web Development - Software Development module
