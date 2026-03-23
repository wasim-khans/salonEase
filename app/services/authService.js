// SalonEase JWT Authentication Service
// Login/Register logic with JWT token management

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Register new user
const register = async (userData) => {
    try {
        const { name, email, password, role = 'customer', gender } = userData;

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );

        if (existingUser.length > 0) {
            return {
                success: false,
                message: 'User already exists with this email'
            };
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (name, email, password, role, gender) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, gender]
        );

        // Get the created user
        const newUser = await db.query(
            'SELECT id, name, email, role, gender FROM users WHERE id = ?',
            [result.insertId]
        );

        const token = generateToken(newUser[0]);

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email,
                role: newUser[0].role,
                gender: newUser[0].gender
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

// Login user
const login = async (email, password) => {
    try {
        // Find user by email
        const users = await db.query(
            'SELECT id, name, email, password, role, gender FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        // Generate token
        const token = generateToken(user);

        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender
            },
            token
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
    register,
    login,
    verifyToken,
    generateToken
};
