# SalonEase — Frontend Tracking

## Current State Summary

### What's Done & Working
- **Layout system** — `layout.pug` with topbar, sidebar mixins for customer/admin
- **Home page** (`/`) — Landing with Sign in / Register links
- **Auth pages** — Login (`/auth/login`) and Register (`/auth/register`) with working JS handlers
- **JWT auth flow** — Token stored in localStorage, role-based redirect after login/register
- **Auth middleware** — `authenticateToken`, `requireType`, `optionalAuth` on backend
- **Customer sidebar** — Services, My Appointments, Book, Logout
- **Admin sidebar** — Appointments, Services, Create Staff, Statistics, Logout
- **CSS** — Complete stylesheet with responsive breakpoints, badges, modals, sidebar, cards
- **Customer services page** (`/customer/services`) — Static service cards (hard-coded)
- **Customer book page** (`/customer/book`) — Booking form (hard-coded services, single select)
- **Customer appointments page** (`/customer/appointments`) — Static appointment table
- **Customer cancel page** (`/customer/cancel`) — Cancel modal (no reason input)
- **Admin appointments page** (`/admin/appointments`) — Shell with JS that fetches mock data
- **Admin cancel/confirm/complete pages** — Empty shells (title + subtitle only)
- **Admin services page** (`/admin/services`) — Hard-coded service cards (same as customer)
- **Admin create-staff page** — Empty shell
- **Admin statistics page** — Empty shell
- **API endpoints** — Register, Login, Get Services, Create Appointment, Get Admin Appointments (mock)

### Route Alignment with Docs

| Doc Route | Current Route | Status |
|-----------|--------------|--------|
| `/` | `/` | ✅ |
| `/auth/login` | `/auth/login` | ✅ |
| `/auth/register` | `/auth/register` | ✅ |
| `/services` | `/customer/services` | ⚠️ Different prefix |
| `/my-appointments` | `/customer/appointments` | ⚠️ Different prefix |
| `/admin/dashboard` | `/admin/appointments` | ⚠️ No dashboard, goes straight to appointments |
| `/admin/appointments/:id` | — | ❌ Missing |
| `/admin/services` | View exists, no route in app.js | ❌ Missing route |
| `/admin/staff` | `/admin/create-staff` (no route) | ❌ Missing route |

---

## To Do

### Priority 1 — Core Data Wiring
- [ ] **Replace hard-coded services with API data** — Customer services page should fetch from `GET /api/services` and render dynamically using the `_serviceCard.pug` mixin or client-side JS
- [ ] **Replace hard-coded services in booking form** — `book.pug` dropdown should be populated from API
- [ ] **Build booking form JS** — `book.pug` needs a script to POST to `/api/customer/appointments` with JWT token
- [ ] **Fetch real appointments** — `customer/appointments.pug` needs JS to call a customer appointments API and render dynamically
- [ ] **Wire up admin appointments** — Replace mock data in `GET /api/admin/appointments` with real DB query; implement `displayAppointments()` to render in the DOM

### Priority 2 — Missing Features per Docs
- [ ] **Multi-service selection** — Docs require selecting one or more services. Change single `<select>` to checkboxes or multi-select
- [ ] **Add "any" staff gender option** — Booking form only has male/female, docs require male/female/any
- [ ] **Edit mode on services page** — Docs say `/services` supports both Create and Edit modes. If status is `in_review`, pre-fill existing booking data
- [ ] **Cancel reason input** — Cancel modal must include a required text input for cancellation reason
- [ ] **Status-based button visibility** — Implement the UI state rules table from docs:
  - Edit button: only if `in_review`
  - Cancel button: only if `in_review` or `confirmed`
  - No buttons for `completed` / `cancelled`

### Priority 3 — Admin Pages
- [ ] **Build `/admin/appointments/:id` page** — The main admin management page: view full details, modify services, adjust time, assign staff, confirm/cancel/complete
- [ ] **Admin confirm form** — Requires: staff assigned, at least one service, start time set
- [ ] **Admin cancel form** — Requires: cancellation reason input
- [ ] **Admin completion form** — Requires: `actual_price`, `service_provided_by`, optional `admin_notes`
- [ ] **Admin dashboard filters** — Filter appointments by status (in_review, confirmed, completed, cancelled)
- [ ] **Admin services CRUD** — Create, Read, Update, Delete services
- [ ] **Admin staff management** — Form to create/manage staff records

### Priority 4 — Security & Quality
- [ ] **Protect page routes server-side** — Add `authenticateToken` + `requireType` middleware to page routes in `app.js` (or redirect to login)
- [ ] **Logout should clear localStorage** — Sidebar logout links must clear JWT token and user data before redirecting
- [ ] **Remove 2s artificial delay** in `login.js` (line 27)
- [ ] **Add try/catch to API routes** — Several handlers in `app.js` lack error handling
- [ ] **Fill or remove empty utility files** — `apiRequests.js` and `notifications.js` are 0 bytes
- [ ] **Fix CSS `.btn-primary` conflict** — `width: 100%` (line 96) clashes with `flex: 1` (line 417)
- [ ] **Add `<select>` styling** in CSS

### Priority 5 — Polish
- [ ] **Add missing admin routes to `app.js`** — `/admin/services`, `/admin/create-staff`, `/admin/statistics`, `/admin/cancel`, `/admin/confirm`, `/admin/complete`
- [ ] **Consistent route naming** — Decide whether to keep `/customer/` prefix or align exactly with docs
- [ ] **Admin services page** — Should show CRUD interface, not just service cards with "Book" buttons
- [ ] **Error/success notifications** — Build a reusable notification system (populate `notifications.js`)
- [ ] **Loading states** — Add spinners/skeletons while data loads

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/app.js` | Express routes (pages + API) |
| `app/middleware/authMiddleware.js` | JWT auth middleware |
| `app/views/layout.pug` | Base HTML layout |
| `app/views/index.pug` | Home / landing page |
| `app/views/auth/login.pug` | Login page |
| `app/views/auth/register.pug` | Register page |
| `app/views/customer/services.pug` | Customer services browsing |
| `app/views/customer/book.pug` | Booking form |
| `app/views/customer/appointments.pug` | Customer appointment list |
| `app/views/customer/cancel.pug` | Cancel confirmation modal |
| `app/views/admin/appointments.pug` | Admin appointment list |
| `app/views/admin/services.pug` | Admin services (currently same as customer) |
| `app/views/admin/confirm.pug` | Admin confirm (empty shell) |
| `app/views/admin/cancel.pug` | Admin cancel (empty shell) |
| `app/views/admin/complete.pug` | Admin complete (empty shell) |
| `app/views/admin/create-staff.pug` | Staff creation (empty shell) |
| `app/views/admin/statistics.pug` | Statistics (empty shell) |
| `app/views/partials/_customerSidebar.pug` | Customer nav sidebar |
| `app/views/partials/_adminSidebar.pug` | Admin nav sidebar |
| `app/views/partials/_serviceCard.pug` | Reusable service card mixin (unused) |
| `static/js/auth/login.js` | Login form handler |
| `static/js/auth/register.js` | Register form handler |
| `static/js/admin/appointments.js` | Admin appointments loader (stub) |
| `static/js/main.js` | Global JS (console.log only) |
| `static/js/utilities/apiRequests.js` | Empty — intended for shared API helpers |
| `static/js/utilities/notifications.js` | Empty — intended for toast/notification system |
| `static/css/style.css` | All styles |
