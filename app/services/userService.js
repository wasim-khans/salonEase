// User Service - Business logic layer for user operations
const User = require('../models/user');
const bcrypt = require('bcrypt');

class UserService {
  // Register new user
  static async register(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  static async login(email, password) {
    try {
      const user = await User.authenticate(email, password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      return {
        success: true,
        user: {
          id: user.id,
          name: User.name,
          email: User.email,
          role: User.role,
          gender: User.gender
        }
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user profile
  static async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Remove sensitive data
      delete user.password;
      return user;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const updated = await User.update(userId, profileData);
      if (!updated) {
        throw new Error('Failed to update profile');
      }
      
      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  // Change user password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Verify current password first
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // For now, simple password check (replace with bcrypt.compare in production)
      const isValid = currentPassword === user.password;
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const updated = await User.updatePassword(userId, hashedNewPassword);
      if (!updated) {
        throw new Error('Failed to update password');
      }
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      return await User.findAll();
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Get users by role
  static async getUsersByRole(role) {
    try {
      return await User.findByRole(role);
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error.message}`);
    }
  }

  // Get staff members
  static async getStaff() {
    try {
      return await User.getStaff();
    } catch (error) {
      throw new Error(`Failed to get staff: ${error.message}`);
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId) {
    try {
      const deleted = await User.delete(userId);
      if (!deleted) {
        throw new Error('Failed to delete user');
      }
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }

  // Update user (admin only)
  static async updateUser(userId, userData) {
    try {
      const updated = await User.update(userId, userData);
      if (!updated) {
        throw new Error('Failed to update user');
      }
      
      return { message: 'User updated successfully' };
    } catch (error) {
      throw new Error(`User update failed: ${error.message}`);
    }
  }
}

module.exports = UserService;
