# SalonEase — Frontend TODO

> Last updated: 10:23 PM, 3rd April 2026

---

## Remaining Work

### 1. Admin Services CRUD Page
**Priority: High**

Build `/admin/services` page to manage salon services.

| Task | Detail |
|------|--------|
| Create `app/views/admin/services.pug` | Table or card layout showing all services with name, category, price, duration |
| Create `static/js/admin/services.js` | Fetch from `GET /api/services`, render list, handle create/edit/delete |
| Add service form modal | Fields: name, category (male/female/both), base_price, duration |
| Edit modal | Pre-fill existing service data, submit `PUT /api/services/:id` |
| Delete button | Confirmation prompt, submit `DELETE /api/services/:id` |
| Add page route in `app.js` | `app.get('/admin/services', ...)` |

---

### 2. Admin Staff Management Page
**Priority: High**

Build `/admin/staff` page to manage staff records.

| Task | Detail |
|------|--------|
| Create `app/views/admin/staff.pug` | Table or card layout showing all staff with name, email, phone, gender |
| Create `static/js/admin/staff.js` | Fetch from `GET /api/admin/staff`, render list, handle create/edit/delete |
| Add staff form modal | Fields: name, email, phone, password, gender |
| Edit modal | Pre-fill existing staff data, submit `PUT /api/admin/staff/:id` |
| Delete button | Confirmation prompt, submit `DELETE /api/admin/staff/:id` |
| Add page route in `app.js` | `app.get('/admin/staff', ...)` |

---

### 3. Logout Functionality
**Priority: Medium**

| Task | Detail |
|------|--------|
| Update sidebar logout links | Clear `localStorage` (jwtToken + user) before redirect |
| Customer sidebar | `_customerSidebar.pug` — logout link should call a JS function |
| Admin sidebar | `_adminSidebar.pug` — same |
| Create `static/js/logout.js` or inline | `localStorage.clear(); window.location.href = '/auth/login';` |

---

### 4. Login Cleanup
**Priority: Medium**

| Task | Detail |
|------|--------|
| Remove 2s delay | `static/js/auth/login.js` line 27 — `setTimeout(resolve, 2000)` is artificial |

---

### 5. Polish & UX
**Priority: Low**

| Task | Detail |
|------|--------|
| Error/success notifications | Build a reusable toast system (populate `static/js/utilities/notifications.js`) — replace `alert()` calls |
| Loading states | Add spinners or skeleton cards while API data loads |
| Fix event listener leak | `static/js/customer/appointments.js` line 141 — `change` listener added every time edit modal opens |
| Fix CSS `.btn-primary` conflict | `width: 100%` (line 96) clashes with `flex: 1` (line 417) |
| Clean up dead pages | Remove unused Pug shells: `admin/confirm.pug`, `admin/cancel.pug`, `admin/complete.pug`, `admin/create-staff.pug`, `admin/statistics.pug`, `customer/cancel.pug` — these are replaced by modals |

---

## Quick Reference

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Admin Services CRUD page (`/admin/services`) | High | ❌ | ( admin should be able to see all the services and manage them with buttons as create, edit, delete and each should be opened in a modal)
| 2 | Admin Staff Management page (`/admin/staff`) | High | ❌ | ( admin should be able to see all the staff and manage them with buttons as create, edit, delete and each should be opened in a modal)
| 3 | Logout clears localStorage | Medium | ❌ | ( logout should clear localStorage and redirect to login page)
| 4 | Remove 2s login delay | Medium | ❌ | ( remove the artificial 2 second delay in login)
| 5 | Toast notification system (replace `alert()`) | Low | ❌ | ( replace all `alert()` calls with a toast notification system)
| 6 | Loading spinners / skeleton cards | Low | ❌ | ( add loading spinners or skeleton cards while API data loads)
| 7 | Fix edit modal event listener leak | Low | ❌ | ( fix the event listener leak in `static/js/customer/appointments.js` line 141)
| 8 | Fix CSS `.btn-primary` conflict | Low | ❌ | ( fix the CSS `.btn-primary` conflict)
| 9 | Remove dead Pug shell pages | Low | ❌ | ( remove unused Pug shells: `admin/confirm.pug`, `admin/cancel.pug`, `admin/complete.pug`, `admin/create-staff.pug`, `admin/statistics.pug`, `customer/cancel.pug`)
