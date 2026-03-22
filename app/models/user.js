// User Model - Database access layer for users table
const db = require('../services/db');

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, role, gender } = userData;
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, gender) VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, role, gender]
    );
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  // Find user by ID (UUID)
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Get all users (for admin management)
  static async findAll() {
    const [rows] = await db.query(
      `SELECT id, name, email, role, gender, created_at FROM users ORDER BY created_at DESC`
    );
    return rows;
  }

  // Get users by role
  static async findByRole(role) {
    const [rows] = await db.query(
      `SELECT id, name, email, gender FROM users WHERE role = ? ORDER BY name`,
      [role]
    );
    return rows;
  }

  // Get staff members (role = 'staff')
  static async getStaff() {
    const [rows] = await db.query(
      `SELECT id, name, email, gender FROM users WHERE role = 'staff' ORDER BY name`
    );
    return rows;
  }

  // Update user
  static async update(id, userData) {
    const { name, email, role, gender } = userData;
    const [result] = await db.query(
      `UPDATE users SET name = ?, email = ?, role = ?, gender = ? WHERE id = ?`,
      [name, email, role, gender, id]
    );
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const [result] = await db.query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  // Authenticate user (for login)
  static async authenticate(email, password) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    // In production, you'd use bcrypt.compare here
    // For now, simple password check
    const isValid = password === user.password; // Replace with bcrypt.compare
    
    if (!isValid) {
      return null;
    }
    
    // Return user without password
    delete user.password;
    return user;
  }
}

module.exports = User;
