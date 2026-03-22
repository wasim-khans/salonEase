// Authentication Service - Business logic for user authentication
const bcrypt = require('bcrypt');
const User = require('../models/user');

class AuthService {
  // Register new user
  static async register(userData) {
    const { name, email, password, role, gender } = userData;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      gender
    });
    
    return { userId, message: 'User registered successfully' };
  }

  // Login user
  static async login(email, password) {
    // Find user by email
    const user = await User.authenticate(email, password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    return {
      user,
      message: 'Login successful'
    };
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    // First authenticate with current password
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // For now, simple password check (replace with bcrypt.compare in production)
    const isValid = currentPassword === user.password; // Replace with actual password verification
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const updated = await User.updatePassword(userId, hashedNewPassword);
    
    if (!updated) {
      throw new Error('Failed to update password');
    }
    
    return { message: 'Password updated successfully' };
  }

  // Validate user session (for middleware)
  static async validateSession(userId) {
    const user = await User.findById(userId);
    return user !== null;
  }

  // Get user by ID (safe version without password)
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (user) {
      delete user.password; // Remove password from response
    }
    return user;
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    const { name, gender } = profileData;
    
    // Don't allow role or email changes through profile update
    const updateData = {};
    if (name) updateData.name = name;
    if (gender) updateData.gender = gender;
    
    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      throw new Error('Failed to update profile');
    }
    
    return { message: 'Profile updated successfully' };
  }
}

module.exports = AuthService;
