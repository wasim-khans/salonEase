# SalonEase — Frontend Tracking

> Last updated: 9:44 PM 3rd April 2026

## Current State Summary

### What's Done & Working

#### Auth & Layout
- **Layout system** — `layout.pug` with topbar, sidebar mixins for customer/admin
- **Home page** (`/`) — Landing with Sign in / Register links
- **Auth pages** — Login (`/auth/login`) and Register (`/auth/register`) with working JS handlers
- **JWT auth flow** — Token stored in localStorage, role-based redirect after login/register
- **Auth middleware** — `authenticateToken`, `requireType`, `optionalAuth` on backend
- **CSS** — Complete stylesheet with responsive breakpoints, badges, modals, sidebar, cards

#### Customer Features (fully working)
- **Services page** (`/customer/services`) — Dynamic service cards fetched from API
- **Booking page** (`/customer/book`) — Multi-select checkboxes, date, time, gender (male/female/any), estimated total
- **Appointments page** (`/customer/appointments`) — Dynamic appointment cards with status badges, estimated cost
- **Edit appointment** — Modal pre-fills services/date/time/gender, submits `PUT /api/customer/appointments/:id`
- **Cancel appointment** — Modal with required reason textarea, submits `PUT /api/customer/appointments/:id/cancel`
- **Status-based buttons** — Edit (in_review only), Cancel (in_review + confirmed), no buttons for completed/cancelled

#### Admin Features (fully working)
- **Appointments page** (`/admin/appointments`) — All appointments with customer info, services, cost
- **Status filters** — All / In Review / Confirmed / Completed / Cancelled
- **Confirm modal** — Assign staff (dropdown from API), set start time, validates ≥1 service
- **Cancel modal** — Required reason textarea
- **Complete modal** — Actual price (pre-filled), staff dropdown (pre-selected if assigned), optional notes
- **Status-based buttons** — Confirm+Cancel (in_review), Complete+Cancel (confirmed), no buttons for completed/cancelled

#### Backend (service layer architecture)
- **Service layer** — All appointment logic in `appointmentService.js` (create, edit, cancel, confirm, complete, fetch)
- **Transactional operations** — Create and edit appointments use DB transactions
- **UUID generation** — All models use `uuidv4()` explicitly (Appointment, Staff, Service)
- **API endpoints** — All customer and admin appointment APIs implemented and protected

### Route Summary

| Route | Page | Status |
|-------|------|--------|
| `/` | Home | ✅ |
| `/auth/login` | Login | ✅ |
| `/auth/register` | Register | ✅ |
| `/customer/services` | Browse services | ✅ |
| `/customer/book` | Book appointment | ✅ |
| `/customer/appointments` | My appointments + edit/cancel modals | ✅ |
| `/admin/appointments` | All appointments + confirm/cancel/complete modals | ✅ |
| `/admin/services` | Services CRUD | ❌ TODO |
| `/admin/staff` | Staff management | ❌ TODO |

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/app.js` | Express routes (pages + API) |
| `app/middleware/authMiddleware.js` | JWT auth middleware |
| `app/services/appointmentService.js` | Appointment business logic (service layer) |
| `app/services/authService.js` | Auth business logic |
| `app/services/serviceService.js` | Service CRUD logic |
| `app/models/appointment.js` | Appointment model |
| `app/models/appointmentServiceMap.js` | Appointment-service mapping model |
| `app/models/service.js` | Service model |
| `app/models/staff.js` | Staff model |
| `app/views/layout.pug` | Base HTML layout |
| `app/views/partials/_modals.pug` | Reusable modal mixins (edit, cancel, confirm, complete) |
| `app/views/customer/appointments.pug` | Customer appointments + modals |
| `app/views/admin/appointments.pug` | Admin appointments + modals |
| `static/js/customer/appointments.js` | Customer appointment cards + edit/cancel modal logic |
| `static/js/customer/book.js` | Booking form with multi-select + API submit |
| `static/js/customer/services.js` | Dynamic service cards from API |
| `static/js/admin/appointments.js` | Admin cards + confirm/cancel/complete modal logic |
| `static/js/auth/login.js` | Login form handler |
| `static/js/auth/register.js` | Register form handler |
| `static/css/style.css` | All styles |
