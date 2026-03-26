  # SalonEase Database Entity Relationship Diagram (ERD)

## Overview
The SalonEase database consists of 6 tables with appointments as the core entity. The system manages salon appointment bookings with support for multiple services per appointment, staff assignment, and comprehensive status tracking.

---

## Entity Relationship Diagram (Text Format)

```
┌─────────────────┐
│   CUSTOMERS     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ phone (UNIQUE)  │
│ password        │
│ gender          │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N (has many)
         │
         └──────────────────────────────┐
                                        │
┌────────────────────────┐     ┌────────▼──────────────────┐
│       ADMINS           │     │    APPOINTMENTS (Core)     │
├────────────────────────┤     ├────────────────────────────┤
│ id (PK)                │     │ id (PK)                    │
│ name                   │     │ customer_id (FK)           │
│ email (UNIQUE)         │     │ appointment_date           │
│ phone (UNIQUE)         │     │ preferred_time             │
│ password               │     │ start_time                 │
│ created_at             │     │ preferred_staff_gender     │
└────────────────────────┘     │ status                     │
                               │ staff_id (FK)              │
                               │ service_provided_by (FK)   │
                               │ completed_by (FK)          │
                               │ cancelled_by               │
                               │ cancellation_reason        │
                               │ actual_price               │
                               │ admin_notes                │
                               │ confirmed_at               │
                               │ created_at                 │
                               │ updated_at                 │
                               └────────┬──────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    │ 1:N (assigned to) │                   │
                    │                   │                   │
         ┌──────────▼─────────┐         │         ┌─────────▼────────────┐
         │      STAFF         │         │         │ APPOINTMENT_SERVICES│
         ├────────────────────┤         │         ├─────────────────────┤
         │ id (PK)            │         │         │ id (PK)             │
         │ name               │         │         │ appointment_id (FK) │
         │ email (UNIQUE)     │         │         │ service_id (FK)     │
         │ phone (UNIQUE)     │         │         │ price (snapshot)    │
         │ password           │         │         └─────────┬───────────┘
         │ gender             │         │                   │
         │ created_at         │         │                   │ N:1 (contains)
         └────────────────────┘         │                   │
                                        │         ┌─────────▼───────────┐
                                        │         │    SERVICES         │
                                        │         ├─────────────────────┤
                                        └─────────┤ id (PK)             │
                         1:N (provides)          │ name                │
                                                 │ category            │
                                                 │ base_price          │
                                                 │ duration (minutes)  │
                                                 │ created_at          │
                                                 └─────────────────────┘
```

---

## Table Details

### 1. **CUSTOMERS**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique customer identifier |
| name | VARCHAR(100) | NOT NULL | Customer full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Customer email |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Customer phone number |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| gender | ENUM | NULLABLE | male, female, other, prefer_not_to_say |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Relationships:**
- 1:N with APPOINTMENTS (one customer has many appointments)

---

### 2. **ADMINS**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique admin identifier |
| name | VARCHAR(100) | NOT NULL | Admin full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Admin email |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Admin phone number |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Relationships:**
- No direct foreign key relationships (administrative user)

---

### 3. **STAFF**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique staff identifier |
| name | VARCHAR(100) | NOT NULL | Staff full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Staff email |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Staff phone number |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| gender | ENUM | NOT NULL | male, female, other, prefer_not_to_say |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Relationships:**
- 1:N with APPOINTMENTS as staff_id (staff can handle multiple appointments)
- 1:N with APPOINTMENTS as service_provided_by (staff who provided the service)
- 1:N with APPOINTMENTS as completed_by (staff who completed the appointment)

---

### 4. **SERVICES**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique service identifier |
| name | VARCHAR(100) | NOT NULL | Service name (e.g., Haircut, Manicure) |
| category | ENUM | NOT NULL | male, female, both |
| base_price | DECIMAL(10,2) | NOT NULL | Standard service price |
| duration | INT | NOT NULL | Service duration in minutes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Service creation timestamp |

**Relationships:**
- 1:N with APPOINTMENT_SERVICES (one service can be booked in many appointments)

---

### 5. **APPOINTMENTS** (Core Entity)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique appointment identifier |
| customer_id | CHAR(36) | FK → CUSTOMERS.id, NOT NULL | Customer booking the appointment |
| appointment_date | DATE | NOT NULL | Scheduled appointment date |
| preferred_time | TIME | NOT NULL | Preferred time for appointment |
| start_time | TIME | NULLABLE | Actual start time |
| preferred_staff_gender | ENUM | DEFAULT 'any' | male, female, any |
| status | ENUM | DEFAULT 'in_review' | in_review, confirmed, completed, cancelled, no_show |
| staff_id | CHAR(36) | FK → STAFF.id, NULLABLE | Assigned staff member |
| service_provided_by | CHAR(36) | FK → STAFF.id, NULLABLE | Staff who provided service |
| completed_by | CHAR(36) | FK → STAFF.id, NULLABLE | Staff who completed appointment |
| cancelled_by | ENUM | NULLABLE | customer, admin |
| cancellation_reason | TEXT | NULLABLE | Reason for cancellation |
| actual_price | DECIMAL(10,2) | NULLABLE | Final appointment price |
| admin_notes | TEXT | NULLABLE | Notes from admin |
| confirmed_at | TIMESTAMP | NULLABLE | Confirmation timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Booking creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Relationships:**
- N:1 with CUSTOMERS (many appointments per customer)
- N:1 with STAFF (via staff_id, service_provided_by, completed_by)
- 1:N with APPOINTMENT_SERVICES (one appointment has many services)

---

### 6. **APPOINTMENT_SERVICES** (Junction Table)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PK, DEFAULT UUID() | Unique record identifier |
| appointment_id | CHAR(36) | FK → APPOINTMENTS.id, NOT NULL | Reference to appointment |
| service_id | CHAR(36) | FK → SERVICES.id, NOT NULL | Reference to service |
| price | DECIMAL(10,2) | NOT NULL | Price snapshot at booking time |

**Relationships:**
- N:1 with APPOINTMENTS (many services per appointment)
- N:1 with SERVICES (many appointments can include same service)
- Implements N:N relationship between APPOINTMENTS and SERVICES

---

## Key Relationships Summary

| From | To | Type | Via | Description |
|------|----|----|-----|-------------|
| CUSTOMERS | APPOINTMENTS | 1:N | customer_id | Each customer can have multiple appointments |
| STAFF | APPOINTMENTS | 1:N | staff_id | Each staff can be assigned to multiple appointments |
| STAFF | APPOINTMENTS | 1:N | service_provided_by | Staff provides service for appointments |
| STAFF | APPOINTMENTS | 1:N | completed_by | Staff completes appointments |
| APPOINTMENTS | APPOINTMENT_SERVICES | 1:N | appointment_id | Each appointment can have multiple services |
| SERVICES | APPOINTMENT_SERVICES | 1:N | service_id | Each service can be booked in multiple appointments |

---

## Indexes for Performance

```sql
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_staff_email ON staff(email);
```

---

## Key Design Features

1. **UUID Primary Keys**: All tables use UUIDs for distributed system compatibility
2. **Appointment Status Workflow**: Tracks appointment lifecycle (in_review → confirmed → completed/cancelled/no_show)
3. **Multiple Services Per Appointment**: Junction table allows flexibility in booking multiple services
4. **Staff Role Flexibility**: One appointment can involve multiple staff members (assignment, service provider, completer)
5. **Price Snapshots**: Service prices are stored in appointment_services for historical accuracy
6. **Audit Timestamps**: All tables have creation/update timestamps for tracking
7. **Gender Preferences**: Supports customer preference for staff gender and service category filtering
8. **Cascading Deletes**: Deleting an appointment automatically removes associated services

---

## Cardinality Legend
- **1:N (One to Many)** - One record in Table A relates to many records in Table B
- **N:1 (Many to One)** - Many records in Table A relate to one record in Table B
- **N:N (Many to Many)** - Implemented via APPOINTMENT_SERVICES junction table
