const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
const Admin = require('../models/admin');
const Staff = require('../models/staff');

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

const registerCustomer = async (userData) => {
    try {
        const { name, email, phone, password, gender } = userData;

        const existingEmail = await Customer.findByEmail(email);
        if (existingEmail) {
            return {
                success: false,
                message: 'A customer already exists with this email'
            };
        }

        const existingPhone = await Customer.findByPhone(phone);
        if (existingPhone) {
            return {
                success: false,
                message: 'A customer already exists with this phone number'
            };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const customerId = await Customer.create({
            name,
            email,
            phone,
            password: hashedPassword,
            gender
        });

        const newCustomer = await Customer.findById(customerId);

        const token = generateCustomerToken(newCustomer);

        return {
            success: true,
            message: 'Customer registered successfully',
            user: {
                id: newCustomer.id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                type: 'customer',
                gender: newCustomer.gender
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

const registerAdmin = async (userData) => {
    try {
        const { name, email, phone, password } = userData;

        const existingAdmin = await Admin.findByEmailOrPhone(email, phone);

        if (existingAdmin) {
            return {
                success: false,
                message: 'Admin already exists with this email'
            };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminId = await Admin.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const newAdmin = await Admin.findById(adminId);

        const token = generateAdminToken(newAdmin);

        return {
            success: true,
            message: 'Admin registered successfully',
            user: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
                phone: newAdmin.phone,
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

const login = async (email, password) => {
    try {
        const customer = await Customer.findByEmail(email);

        if (customer) {
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

        const admin = await Admin.findByEmail(email);

        if (admin) {
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
