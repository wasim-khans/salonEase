// SalonEase JWT Authentication Service
// Login/Register logic with JWT token management

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Generate JWT token for customer
const generateCustomerToken = (customer) => {
    return jwt.sign(
        { 
            id: customer.id, 
            email: customer.email, 
            type: 'customer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Generate JWT token for admin
const generateAdminToken = (admin) => {
    return jwt.sign(
        { 
            id: admin.id, 
            email: admin.email, 
            type: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Generate JWT token for staff
const generateStaffToken = (staff) => {
    return jwt.sign(
        { 
            id: staff.id, 
            email: staff.email, 
            type: 'staff',
            gender: staff.gender
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Register new customer
const registerCustomer = async (userData) => {
    try {
        const { name, email, password, gender } = userData;

        // Check if customer already exists
        const existingCustomer = await db.query(
            'SELECT id FROM customers WHERE email = ?', 
            [email]
        );

        if (existingCustomer.length > 0) {
            return {
                success: false,
                message: 'Customer already exists with this email'
            };
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new customer
        const result = await db.query(
            'INSERT INTO customers (name, email, password, gender) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, gender]
        );

        // Get the created customer
        const newCustomer = await db.query(
            'SELECT id, name, email, gender FROM customers WHERE id = ?',
            [result.insertId]
        );

        const token = generateCustomerToken(newCustomer[0]);

        return {
            success: true,
            message: 'Customer registered successfully',
            user: {
                id: newCustomer[0].id,
                name: newCustomer[0].name,
                email: newCustomer[0].email,
                type: 'customer',
                gender: newCustomer[0].gender
            },
            token
        };

    } catch (error) {
        return {
            success: false,
            message: 'Registration failed',
            error: error.message
        };
    }
};

// Register new admin (separate function for security)
const registerAdmin = async (userData) => {
    try {
        const { name, email, password } = userData;

        // Check if admin already exists
        const existingAdmin = await db.query(
            'SELECT id FROM admins WHERE email = ?', 
            [email]
        );

        if (existingAdmin.length > 0) {
            return {
                success: false,
                message: 'Admin already exists with this email'
            };
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin
        const result = await db.query(
            'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Get the created admin
        const newAdmin = await db.query(
            'SELECT id, name, email FROM admins WHERE id = ?',
            [result.insertId]
        );

        const token = generateAdminToken(newAdmin[0]);

        return {
            success: true,
            message: 'Admin registered successfully',
            user: {
                id: newAdmin[0].id,
                name: newAdmin[0].name,
                email: newAdmin[0].email,
                type: 'admin'
            },
            token
        };

    } catch (error) {
        return {
            success: false,
            message: 'Admin registration failed',
            error: error.message
        };
    }
};

// Login user (checks all tables)
const login = async (email, password) => {
    try {
        // Try customer table first
        let customers = await db.query(
            'SELECT id, name, email, password, gender FROM customers WHERE email = ?',
            [email]
        );

        if (customers.length > 0) {
            const customer = customers[0];
            const isValidPassword = await bcrypt.compare(password, customer.password);
            
            if (isValidPassword) {
                const token = generateCustomerToken(customer);
                return {
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: customer.id,
                        name: customer.name,
                        email: customer.email,
                        type: 'customer',
                        gender: customer.gender
                    },
                    token
                };
            }
        }

        // Try admin table
        let admins = await db.query(
            'SELECT id, name, email, password FROM admins WHERE email = ?',
            [email]
        );

        if (admins.length > 0) {
            const admin = admins[0];
            const isValidPassword = await bcrypt.compare(password, admin.password);
            
            if (isValidPassword) {
                const token = generateAdminToken(admin);
                return {
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        type: 'admin'
                    },
                    token
                };
            }
        }

        // Try staff table
        let staff = await db.query(
            'SELECT id, name, email, password, gender FROM staff WHERE email = ?',
            [email]
        );

        if (staff.length > 0) {
            const staffMember = staff[0];
            const isValidPassword = await bcrypt.compare(password, staffMember.password);
            
            if (isValidPassword) {
                const token = generateStaffToken(staffMember);
                return {
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: staffMember.id,
                        name: staffMember.name,
                        email: staffMember.email,
                        type: 'staff',
                        gender: staffMember.gender
                    },
                    token
                };
            }
        }

        // No user found or invalid password
        return {
            success: false,
            message: 'Invalid email or password'
        };

    } catch (error) {
        return {
            success: false,
            message: 'Login failed',
            error: error.message
        };
    }
};

// Verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    registerCustomer,
    registerAdmin,
    login,
    verifyToken,
    generateCustomerToken,
    generateAdminToken,
    generateStaffToken
};
