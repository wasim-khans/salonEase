# SalonEase — Backend TODO

> Last updated: 10:23 PM, 3rd April 2026

---

## Remaining Work

### 1. Admin Services CRUD API
**Priority: High**

Create `POST`, `PUT`, `DELETE` endpoints for services.

| Task | Detail |
|------|--------|
| Create `serviceService.js` functions | `createService`, `updateService`, `deleteService` — validate inputs, call `Service` model |
| Add routes to `app.js` | `POST /api/services` (admin), `PUT /api/services/:id` (admin), `DELETE /api/services/:id` (admin) |
| Protect with middleware | `authenticateToken` + `requireType(['admin'])` |
| Validation | name (required), category (male/female/both), base_price > 0, duration > 0 |

**Model methods already exist:** `Service.create()`, `Service.update()`, `Service.delete()` — all fixed with proper UUID generation.

---

### 2. Admin Staff Management API
**Priority: High**

Create `POST`, `PUT`, `DELETE` endpoints for staff.

| Task | Detail |
|------|--------|
| Add to `staffService.js` | `createStaff`, `updateStaff`, `deleteStaff` — validate inputs, hash password, call `Staff` model (`getAllStaff` already done) |
| Add routes to `app.js` | `POST /api/admin/staff` (admin), `PUT /api/admin/staff/:id` (admin), `DELETE /api/admin/staff/:id` (admin) |
| Protect with middleware | `authenticateToken` + `requireType(['admin'])` |
| Validation | name, email (unique), phone (unique), password, gender (male/female/other/prefer_not_to_say) |

**Model methods already exist:** `Staff.create()`, `Staff.update()`, `Staff.delete()` — all fixed with proper UUID generation.

---

### 3. Cleanup & Quality
**Priority: Medium**

| Task | Detail |
|------|--------|
| Fill or remove `apiRequests.js` | `static/js/utilities/apiRequests.js` is 0 bytes |
| Fill or remove `notifications.js` | `static/js/utilities/notifications.js` is 0 bytes |

---

### 4. Nice-to-Have
**Priority: Low**

| Task | Detail |
|------|--------|
| `no_show` status support | Listed in schema ENUM but no endpoint to set it |
| Dashboard statistics API | `GET /api/admin/dashboard/stats` — appointment counts by status, revenue totals |
| Pagination for appointments | Currently returns all appointments in one query |

---

## Quick Reference

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Services CRUD API (`POST`, `PUT`, `DELETE /api/services`) | High | ❌ | ( admin should be able to create, update, delete services)
| 2 | Staff Management API (`POST`, `PUT`, `DELETE /api/admin/staff`) | High | ❌ | ( admin should be able to create, update, delete staff)
| 3 | Fill or remove empty utility JS files | Medium | ❌ | ( fill or remove the empty files)
| 4 | `no_show` status endpoint | Low | ❌ | ( add endpoint to set appointment status to no_show)
| 5 | Dashboard statistics API | Low | ❌ | ( add endpoint to get dashboard statistics)
| 6 | Appointment pagination | Low | ❌ | ( add pagination to appointments endpoint)
