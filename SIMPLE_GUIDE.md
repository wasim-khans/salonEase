# SalonEase - Simple Project Guide

## 📁 Project Structure

```
salonease/
├── index.js                 # 🚀 Starts the server
├── app/
│   ├── app.js               # 📱 All routes (GET/POST)
│   ├── middleware/
│   │   └── authMiddleware.js # 🛡️ JWT token checking
│   ├── services/
│   │   ├── authService.js   # 🔐 Login/register logic
│   │   └── db.js           # 🗄️ Database connection
│   ├── models/              # 📊 Database queries (empty placeholders)
│   └── views/               # 🎨 HTML pages
│       ├── index.pug        # 🏠 Landing page
│       ├── layout.pug       # 📄 Page template
│       └── auth/            # 🔐 Login/register pages
├── db/
│   └── schema.sql           # 🗃️ Database table creation
├── static/                  # 📁 CSS, images, client JS
├── .env                     # ⚙️ Database passwords, secrets
└── docker-compose.yml      # 🐳 Runs MySQL + app
```

## 🎯 What Each Folder Does

### **📁 Root Files**
- `index.js` - Starts Node.js server on port 3000
- `.env` - Secret keys and database passwords
- `docker-compose.yml` - Runs MySQL database in container

### **📁 app/ - Main Application**
- `app.js` - All website routes (pages + APIs)
- `middleware/` - Security checks (JWT tokens)
- `services/` - Business logic (login, database)
- `models/` - Database operations (empty for now)
- `views/` - HTML pages user sees

### **📁 Purpose of Each Type**

**🔧 Services** - Business logic
```javascript
// authService.js - handles login/register
// db.js - connects to MySQL database
```

**📊 Models** - Database operations  
```javascript
// user.js - user database queries (empty placeholder)
// appointment.js - appointment queries (empty placeholder)
```

**🛡️ Middleware** - Security
```javascript
// authMiddleware.js - checks JWT tokens, user roles
```

**🎨 Views** - HTML pages
```javascript
// index.pug - landing page with login/register links
// auth/login.pug - login form
// auth/register.pug - registration form
```

---

## 🔄 User Workflow

### **Step 1: User Visits Website**
```
User goes to: http://localhost:3000
↓
Shows: index.pug (landing page)
↓
Sees: "Welcome to SalonEase" + Login + Register buttons
```

### **Step 2: User Clicks Login**
```
Click: Login button
↓
Goes to: /auth/login
↓
Shows: auth/login.pug (login form)
↓
User enters email/password
```

### **Step 3: User Submits Login Form**
```
Form POSTs to: /api/auth/login
↓
app.js route handles POST request
↓
Calls: authService.login(email, password)
↓
Checks database for user
↓
If valid: Returns JWT token
↓
If invalid: Returns error message
```

### **Step 4: Login Success**
```
Frontend receives:
{
  "success": true,
  "user": { "name": "John", "role": "customer" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
↓
Frontend saves JWT token
↓
Can now access protected routes
```

---

## 🛡️ How JWT Protection Works

### **Without Token:**
```
GET /api/appointments/my
↓
Returns: 401 Unauthorized
```

### **With Token:**
```
GET /api/appointments/my
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
↓
authMiddleware.authenticateToken checks token
↓
If valid: Continues to route handler
↓
Returns: User's appointments
```

---

## 🚀 Quick Start for Team

1. **Start Everything:**
   ```bash
   docker-compose up -d
   ```

2. **Visit Website:**
   ```
   http://localhost:3000
   ```

3. **Test API:**
   ```bash
   # Register
   curl -X POST http://localhost:3000/api/auth/register \
     -d '{"name":"Test","email":"test@example.com","password":"123"}' \
     -H "Content-Type: application/json"
   
   # Login  
   curl -X POST http://localhost:3000/api/auth/login \
     -d '{"email":"test@example.com","password":"123"}' \
     -H "Content-Type: application/json"
   ```

---

## 🎯 What to Build Next

### **Add New Features:**
1. **Route in app.js**
   ```javascript
   app.post('/api/appointments/book', authenticateToken, (req, res) => {
       // Save appointment to database
   });
   ```

2. **Logic in services/**
   ```javascript
   // appointmentService.js
   module.exports = {
       createAppointment: async (data) => {
           // Database save logic
       }
   };
   ```

3. **Database in models/**
   ```javascript
   // appointment.js  
   module.exports = {
       save: async (appointment) => {
           // SQL query to save
       }
   };
   ```

That's it! Simple JWT authentication template ready for salon features. 🚀
