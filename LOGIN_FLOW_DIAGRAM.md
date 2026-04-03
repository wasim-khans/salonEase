# 🔐 SalonEase Login Flow - Complete Journey

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (Client Side)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Step 1: User visits login page
                                      ▼
                            GET /auth/login
                                      │
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER: app.js (Line 23-25)                          │
│                                                                               │
│  app.get('/auth/login', (req, res) => {                                     │
│      res.render('auth/login', { title: 'Login - SalonEase' });              │
│  });                                                                          │
│                                                                               │
│  📝 What happens: Express receives GET request and renders login.pug         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Renders HTML page
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VIEW: app/views/auth/login.pug                            │
│                                                                               │
│  - Creates HTML form with email & password fields                            │
│  - Includes <script src="/js/auth/login.js"> at bottom                      │
│  - Form has id="loginForm"                                                   │
│                                                                               │
│  📝 What happens: Browser displays login form to user                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Page loads, script executes
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  STATIC JS: static/js/auth/login.js                          │
│                                                                               │
│  document.addEventListener('DOMContentLoaded', () => {                       │
│      const loginForm = document.querySelector('form');                       │
│      loginForm.addEventListener('submit', async (e) => {                     │
│          e.preventDefault(); // Stop default form submission                 │
│      });                                                                      │
│  });                                                                          │
│                                                                               │
│  📝 What happens: JavaScript attaches event listener to form                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    User fills form and clicks "Sign in"
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              STATIC JS: static/js/auth/login.js (Lines 8-18)                 │
│                                                                               │
│  const email = document.getElementById('email').value;                       │
│  const password = document.getElementById('password').value;                 │
│                                                                               │
│  const response = await fetch('/api/auth/login', {                          │
│      method: 'POST',                                                          │
│      headers: { 'Content-Type': 'application/json' },                       │
│      body: JSON.stringify({ email, password })                              │
│  });                                                                          │
│                                                                               │
│  📝 What happens: Grabs form data and sends POST request to server           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ POST /api/auth/login
                                      │ Body: { email: "user@example.com", password: "secret123" }
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SERVER: app.js (Lines 63-71)                            │
│                                                                               │
│  app.post('/api/auth/login', async (req, res) => {                          │
│      const { email, password } = req.body;                                   │
│                                                                               │
│      // VALIDATION CHECK                                                     │
│      if (!email || !password) {                                              │
│          return res.status(400).json({                                       │
│              success: false,                                                  │
│              message: 'Email and password are required'                      │
│          });                                                                  │
│      }                                                                        │
│                                                                               │
│      // Call business logic layer                                            │
│      const result = await login(email, password);                           │
│      res.status(result.success ? 200 : 401).json(result);                   │
│  });                                                                          │
│                                                                               │
│  📝 What happens:                                                             │
│     1. Extract email & password from request body                            │
│     2. Validate both fields exist (if not, return 400 error)                │
│     3. Call login() function from authService                                │
│     4. Return 200 (success) or 401 (unauthorized) with result               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Calls login(email, password)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              SERVICE: app/services/authService.js (Lines 147-203)            │
│                          BUSINESS LOGIC LAYER                                │
│                                                                               │
│  const login = async (email, password) => {                                 │
│      try {                                                                    │
│          // STEP 1: Check Customer table                                     │
│          const customer = await Customer.findByEmail(email);                │
│                                                                               │
│          if (customer) {                                                      │
│              // STEP 2: Compare passwords using bcrypt                       │
│              const isValidPassword = await bcrypt.compare(                  │
│                  password,           // Plain text from user                 │
│                  customer.password   // Hashed password from DB              │
│              );                                                               │
│                                                                               │
│              if (isValidPassword) {                                          │
│                  // STEP 3: Generate JWT token                               │
│                  const token = generateCustomerToken(customer);             │
│                  return {                                                     │
│                      success: true,                                          │
│                      user: { id, name, email, type: 'customer', gender },   │
│                      token                                                    │
│                  };                                                           │
│              }                                                                │
│          }                                                                    │
│                                                                               │
│          // STEP 4: If not customer, check Admin table                       │
│          const admin = await Admin.findByEmail(email);                      │
│          // ... same password check logic ...                                │
│                                                                               │
│          // STEP 5: No match found                                           │
│          return { success: false, message: 'Invalid email or password' };   │
│      } catch (error) {                                                        │
│          return { success: false, message: 'Login failed' };                │
│      }                                                                        │
│  };                                                                           │
│                                                                               │
│  📝 What happens: Business logic orchestrates the login process              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Calls Customer.findByEmail(email)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                MODEL: app/models/customer.js (Lines 4-10)                    │
│                          DATA ACCESS LAYER                                   │
│                                                                               │
│  async findByEmail(email) {                                                  │
│      const [rows] = await db.pool.execute(                                  │
│          `SELECT * FROM customers WHERE email = ?`,                         │
│          [email]                                                              │
│      );                                                                       │
│      return rows[0];  // Returns customer object or undefined               │
│  }                                                                            │
│                                                                               │
│  📝 What happens:                                                             │
│     1. Executes SQL query to find customer by email                          │
│     2. Returns customer record with ALL fields including hashed password    │
│     3. If no match, returns undefined                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Returns customer object
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BACK TO SERVICE: authService.js                          │
│                                                                               │
│  🔐 THE BCRYPT STORY (Line 152)                                              │
│                                                                               │
│  const isValidPassword = await bcrypt.compare(password, customer.password); │
│                                                                               │
│  What's happening here:                                                      │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ 1. User typed: "myPassword123"                                 │         │
│  │    (plain text from login form)                                │         │
│  │                                                                 │         │
│  │ 2. Database has: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."           │         │
│  │    (hashed password stored during registration)                │         │
│  │                                                                 │         │
│  │ 3. bcrypt.compare() does this:                                 │         │
│  │    - Takes the plain text password                             │         │
│  │    - Hashes it using the SAME salt from the stored hash        │         │
│  │    - Compares the two hashes                                   │         │
│  │    - Returns true if they match, false otherwise               │         │
│  │                                                                 │         │
│  │ 4. Why not just compare plain text?                            │         │
│  │    - SECURITY! We NEVER store passwords in plain text          │         │
│  │    - If database is hacked, attackers can't see real passwords │         │
│  │    - Each password has unique salt, same password = diff hash  │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
│  If isValidPassword is TRUE:                                                 │
│      → Generate JWT token                                                    │
│      → Return success with user data & token                                │
│                                                                               │
│  If isValidPassword is FALSE:                                                │
│      → Continue to check Admin table                                         │
│      → If still no match, return "Invalid email or password"                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Returns result object
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACK TO: app.js (Line 70)                               │
│                                                                               │
│  res.status(result.success ? 200 : 401).json(result);                       │
│                                                                               │
│  Sends JSON response to browser:                                             │
│  {                                                                            │
│      success: true,                                                          │
│      message: 'Login successful',                                            │
│      user: { id: '123', name: 'John', email: 'john@ex.com', type: 'customer' },│
│      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'                        │
│  }                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP Response
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              STATIC JS: static/js/auth/login.js (Lines 20-38)                │
│                                                                               │
│  const data = await response.json();                                         │
│                                                                               │
│  if (data.success) {                                                         │
│      // Store token & user info in browser's localStorage                    │
│      localStorage.setItem('jwtToken', data.token);                          │
│      localStorage.setItem('user', JSON.stringify(data.user));               │
│                                                                               │
│      // Redirect based on user type                                          │
│      if (data.user.type === 'customer') {                                   │
│          window.location.href = '/customer/services';                       │
│      } else if (data.user.type === 'admin') {                               │
│          window.location.href = '/admin/appointments';                      │
│      }                                                                        │
│  } else {                                                                     │
│      alert(data.message || 'Login failed');                                 │
│  }                                                                            │
│                                                                               │
│  📝 What happens: Store credentials and redirect user to their dashboard     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Redirect
                                      ▼
                            ✅ User is logged in!
                     Redirected to /customer/services


═══════════════════════════════════════════════════════════════════════════════

## 📊 Architecture Layers Summary

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  Files: app/views/auth/login.pug, static/js/auth/login.js                  │
│  Role: Display UI, capture user input, send to server                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING LAYER                                   │
│  File: app/app.js                                                            │
│  Role: Map URLs to handlers, validate input, call services                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BUSINESS LOGIC LAYER                              │
│  File: app/services/authService.js                                          │
│  Role: Orchestrate login flow, password verification, token generation      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA ACCESS LAYER                                │
│  Files: app/models/customer.js, app/models/admin.js                        │
│  Role: Execute SQL queries, return data from database                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 DATABASE                                     │
│  MySQL: salonease_db (customers, admins tables)                             │
│  Role: Store user data with hashed passwords                                │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

## 🔑 Key Concepts Explained

### 1. Why Separate Layers?
- **Maintainability**: Change database without touching business logic
- **Testability**: Test each layer independently
- **Reusability**: Use same model methods in different services
- **Clarity**: Each file has ONE clear responsibility

### 2. The bcrypt Password Security Story
```
REGISTRATION TIME:
User creates password: "hello123"
    ↓
bcrypt.hash("hello123", 10)
    ↓
Stored in DB: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
    ↓
Original password is NEVER stored!

LOGIN TIME:
User types: "hello123"
    ↓
bcrypt.compare("hello123", "$2b$10$N9qo8uLOickgx2ZMRZoMye...")
    ↓
Bcrypt hashes "hello123" with same salt
    ↓
Compares hashes → Returns true/false
    ↓
Never reveals the original password!
```

### 3. Model Usage in Service
```javascript
// ❌ OLD WAY (Raw SQL in service)
const customers = await db.query(
    'SELECT * FROM customers WHERE email = ?',
    [email]
);

// ✅ NEW WAY (Using model)
const customer = await Customer.findByEmail(email);
```

**Benefits:**
- SQL query is in ONE place (model)
- Service just calls `Customer.findByEmail()`
- If you need to change the query, change it ONCE in the model
- All services using this model get the update automatically

### 4. Error Handling Flow
```
User enters wrong password
    ↓
bcrypt.compare() returns false
    ↓
Service returns { success: false, message: 'Invalid email or password' }
    ↓
app.js sends 401 status code
    ↓
Browser JavaScript shows alert('Invalid email or password')
```

═══════════════════════════════════════════════════════════════════════════════

## 🎯 Quick Reference

| Layer | File | Responsibility |
|-------|------|----------------|
| View | `login.pug` | HTML form structure |
| Client JS | `static/js/auth/login.js` | Form handling, API calls |
| Router | `app.js` | Route mapping, validation |
| Service | `authService.js` | Business logic, password check |
| Model | `customer.js` | Database queries |
| Database | MySQL | Data storage |

