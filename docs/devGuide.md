# Development Guide - SalonEase

## Project Structure

```
salonEase/
├── app/
│   ├── app.js                 # Main Express app - routes & middleware
│   ├── middleware/            # Authentication & authorization
│   ├── services/              # Business logic (auth, appointments, staff)
│   └── views/                 # Pug templates
│       ├── admin/
│       ├── customer/
│       └── auth/
├── static/
│   ├── js/                    # Client-side JavaScript
│   │   ├── admin/
│   │   ├── customer/
│   │   └── auth/
│   └── css/                   # Stylesheets
└── db/
    ├── schema.sql             # Database schema
    ├── cleaner.js             # Clean database
    └── smart-seeder.js        # Seed test data
```

---

## Creating a New Page

### 1. Create the Pug Template
**Location:** `app/views/{role}/{page-name}.pug`

Example: Admin appointments page
```
app/views/admin/appointments.pug
```

**Template structure:**
```pug
extends ../layout

block content
  h1 Page Title
  
  #content-container
    p Loading...

  script(src="/js/admin/appointments.js")
```

### 2. Create Client-Side JavaScript
**Location:** `static/js/{role}/{page-name}.js`

Example:
```
static/js/admin/appointments.js
```

**JavaScript structure:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || user.type !== 'admin') {
        window.location.href = '/auth/login';
        return;
    }
    
    // Load data from API
    loadData();
});

async function loadData() {
    const token = localStorage.getItem('jwtToken');
    
    const response = await fetch('/api/admin/data', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    // Update UI with data
}
```

### 3. Add Page Route in app.js
**Location:** `app/app.js`

**Pattern:** Page routes are PUBLIC (no middleware)

```javascript
// Admin pages
app.get('/admin/appointments', (req, res) => {
    res.render('admin/appointments', { title: 'Appointments - SalonEase' });
});
```

**Note:** Pages don't use `authenticateToken` middleware. Authentication is handled client-side via JavaScript checking localStorage.

---

## Creating an API Endpoint

### 1. Create Service Function
**Location:** `app/services/{domain}Service.js`

Example: `app/services/appointmentService.js`

```javascript
const db = require('./db');

const getAllAppointments = async () => {
    try {
        const appointments = await db.query(`
            SELECT * FROM appointments
        `);
        
        return {
            success: true,
            appointments: appointments
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        };
    }
};

module.exports = {
    getAllAppointments
};
```

### 2. Add API Route in app.js
**Location:** `app/app.js`

**Pattern:** API routes are PROTECTED (with middleware)

```javascript
const { getAllAppointments } = require('./services/appointmentService');

// API routes - protected with authentication
app.get('/api/admin/appointments', authenticateToken, requireType(['admin']), async (req, res) => {
    const result = await getAllAppointments();
    res.status(result.success ? 200 : 500).json(result);
});
```

**Middleware:**
- `authenticateToken` - Validates JWT token from Authorization header
- `requireType(['admin'])` - Ensures user has admin role

---

## Architecture Pattern

### Frontend (Pages)
1. **Pug template** - HTML structure
2. **Client-side JS** - Handles auth checks, API calls, UI updates
3. **Page route** - Public, just renders HTML

### Backend (API)
1. **Service layer** - Business logic & database queries
2. **API route** - Protected with middleware, calls service
3. **Middleware** - Authentication & authorization

### Data Flow

**Page Load:**
```
User → Page Route (public) → Pug Template → Browser
```

**API Call:**
```
Browser JS → API Route (protected) → Middleware → Service → Database
```

---

## Key Principles

### ✅ DO:
- Keep business logic in **services**
- Protect **API routes** with middleware
- Keep **page routes** public
- Handle auth checks in **client-side JavaScript**
- Use **transactions** for multi-table operations
- Return consistent response format: `{ success, data/message, error? }`

### ❌ DON'T:
- Put database queries directly in routes
- Protect page routes with middleware (browser can't send custom headers)
- Hardcode data - fetch from database
- Skip error handling
- Mix authentication methods (use JWT everywhere)

---

## Common Patterns

### Form Submission
```javascript
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('jwtToken');
    const formData = {
        field1: document.getElementById('field1').value,
        field2: document.getElementById('field2').value
    };
    
    const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    if (data.success) {
        // Handle success
    }
});
```

### Database Transaction
```javascript
const connection = await db.pool.getConnection();
try {
    await connection.beginTransaction();
    
    // Multiple queries
    await connection.execute('INSERT INTO table1...');
    await connection.execute('INSERT INTO table2...');
    
    await connection.commit();
    return { success: true };
} catch (error) {
    await connection.rollback();
    return { success: false, error: error.message };
} finally {
    connection.release();
}
```

---

## Quick Reference

**New Admin Page:**
1. `app/views/admin/page.pug`
2. `static/js/admin/page.js`
3. `app/app.js` → `app.get('/admin/page', ...)`

**New API Endpoint:**
1. `app/services/domainService.js` → Add function
2. `app/app.js` → Import & create route with middleware

**Authentication:**
- Pages: Client-side check (localStorage)
- APIs: Server-side middleware (JWT in headers)
