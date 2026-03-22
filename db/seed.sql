-- SalonEase Database Seed Data
-- Sample data for testing and development

USE salonease_db;

-- Insert sample users
INSERT INTO users (name, email, password, role, gender) VALUES
('Admin User', 'admin@salonease.com', '$2b$10$example_hashed_password', 'admin', 'female'),
('John Smith', 'john.smith@email.com', '$2b$10$example_hashed_password', 'customer', 'male'),
('Sarah Johnson', 'sarah.j@email.com', '$2b$10$example_hashed_password', 'customer', 'female'),
('Mike Wilson', 'mike.wilson@email.com', '$2b$10$example_hashed_password', 'staff', 'male'),
('Emma Davis', 'emma.davis@email.com', '$2b$10$example_hashed_password', 'staff', 'female'),
('Robert Brown', 'robert.brown@email.com', '$2b$10$example_hashed_password', 'customer', 'male'),
('Lisa Anderson', 'lisa.anderson@email.com', '$2b$10$example_hashed_password', 'customer', 'female');

-- Insert sample services
INSERT INTO services (name, category, base_price, duration) VALUES
('Haircut', 'male', 25.00, 30),
('Beard Trim', 'male', 15.00, 15),
('Hair Color', 'female', 80.00, 120),
('Haircut & Style', 'female', 45.00, 60),
('Manicure', 'both', 30.00, 45),
('Pedicure', 'both', 40.00, 60),
('Facial Treatment', 'female', 65.00, 90),
('Hair Wash & Blow Dry', 'both', 35.00, 45),
('Beard Shave', 'male', 20.00, 20),
('Deep Conditioning', 'female', 50.00, 75);

-- Insert sample appointments
INSERT INTO appointments (user_id, appointment_date, preferred_time, start_time, preferred_staff_gender, status, staff_id, service_provided_by, actual_price, admin_notes, confirmed_at, completed_by, created_at) VALUES
(2, '2024-03-25', '10:00:00', '10:30:00', 'male', 'confirmed', 4, 4, 25.00, 'Customer called to confirm', '2024-03-20 09:15:00', 1, '2024-03-15 14:30:00'),
(3, '2024-03-26', '14:00:00', '14:00:00', 'female', 'confirmed', 5, 5, 80.00, 'First time customer', '2024-03-20 11:20:00', 1, '2024-03-16 10:45:00'),
(6, '2024-03-27', '11:00:00', NULL, 'any', 'in_review', NULL, NULL, NULL, NULL, NULL, NULL, '2024-03-18 16:20:00'),
(7, '2024-03-24', '15:00:00', '15:00:00', 'female', 'completed', 5, 5, 45.00, 'Customer satisfied with service', '2024-03-19 09:30:00', 1, '2024-03-17 13:15:00'),
(2, '2024-03-28', '09:00:00', NULL, 'male', 'in_review', NULL, NULL, NULL, NULL, NULL, NULL, '2024-03-19 17:45:00');

-- Insert sample appointment services
INSERT INTO appointment_services (appointment_id, service_id, price) VALUES
(1, 1, 25.00),  -- John Smith - Haircut
(2, 3, 80.00),  -- Sarah Johnson - Hair Color
(4, 2, 20.00),  -- Lisa Anderson - Beard Shave
(4, 4, 45.00),  -- Lisa Anderson - Haircut & Style
(6, 5, 30.00),  -- Robert Brown - Manicure
(6, 6, 40.00);  -- Robert Brown - Pedicure

-- Note: Passwords should be properly hashed using bcrypt in the application
-- Example hashes would be generated using: bcrypt.hash('password', 10)
