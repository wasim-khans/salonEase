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

## 🔐 Authentication
- JWT-based authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`

## 🗄️ Database
- MySQL 8.0 with Docker
- Automatic schema creation from `db/schema.sql`
- Persistent data storage

---

This repository showcases lab work for the MSc in Web Development - Software Development module
