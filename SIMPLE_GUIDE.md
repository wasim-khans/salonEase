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
- `.env` - Secret keys and database passwords (create from `.env.example`)
- `.env.example` - Template for environment variables
- `docker-compose.yml` - Runs MySQL database + app + phpMyAdmin
- `Dockerfile` - Builds the Node.js application container

### **📁 app/ - Main Application**
- `app.js` - All website routes (pages + APIs)
- `middleware/` - Security checks (JWT tokens)
- `services/` - Business logic (login, database)
- `models/` - Database operations
- `views/` - HTML pages user sees

### **📁 db/ - Database Management**
- `schema.sql` - Creates all database tables automatically
- `seeder.js` - Populates database with test data (run with `npm run db:seed`)
- `cleaner.js` - Clears all data from tables (run with `npm run db:clean`)
- `updater.js` - Updates database schema when needed

### **📁 Purpose of Each Type**

**🔧 Services** - Business logic
```javascript
// authService.js - handles login/register with JWT
// db.js - connects to MySQL database
```

**📊 Models** - Database operations  
```javascript
// user.js - user database queries
// appointment.js - appointment queries
// Add more models as needed
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

### Prerequisites
- Docker Desktop installed and running
- Git

### Setup (2 commands)
```bash
# 1. Clone the repository
git clone [your-repo-url]
cd salonEase

# 2. Create environment file and start
cp .env.example .env
docker-compose up -d
```

### 📱 Access Points
- **Application**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8081
  - Username: `root`
  - Password: From your `.env` file

### 🛠️ Common Commands
```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f salonease-web

# Stop everything
docker-compose down

# Seed database with test data
npm run db:seed

# Clean database
npm run db:clean
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
