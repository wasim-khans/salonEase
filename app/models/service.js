// Service Model - Database access layer for services table
const db = require('../services/db');

class Service {
  // Create new service
  static async create(serviceData) {
    const { name, category, base_price, duration } = serviceData;
    const result = await db.query(
      `INSERT INTO services (name, category, base_price, duration) VALUES (?, ?, ?, ?)`,
      [name, category, base_price, duration]
    );
    return result.insertId;
  }

  // Get all services
  static async getAll() {
    const rows = await db.query(
      `SELECT * FROM services ORDER BY category, name`
    );
    return rows;
  }

  // Find service by ID (UUID)
  static async findById(id) {
    const rows = await db.query(
      `SELECT * FROM services WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Get services by category
  static async getByCategory(category) {
    const rows = await db.query(
      `SELECT * FROM services WHERE category = ? ORDER BY name`,
      [category]
    );
    return rows;
  }

  // Get services for specific gender
  static async getForGender(gender) {
    let whereClause = '';
    if (gender === 'male') {
      whereClause = `WHERE category IN ('male', 'both')`;
    } else if (gender === 'female') {
      whereClause = `WHERE category IN ('female', 'both')`;
    }
    // 'both' or no filter returns all services
    
    const rows = await db.query(
      `SELECT * FROM services ${whereClause} ORDER BY category, name`
    );
    return rows;
  }

  // Update service
  static async update(id, serviceData) {
    const { name, category, base_price, duration } = serviceData;
    const result = await db.query(
      `UPDATE services SET name = ?, category = ?, base_price = ?, duration = ? WHERE id = ?`,
      [name, category, base_price, duration, id]
    );
    return result.affectedRows > 0;
  }

  // Delete service
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM services WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get service price at time of booking
  static async getPrice(id) {
    const rows = await db.query(
      `SELECT base_price FROM services WHERE id = ?`,
      [id]
    );
    return rows[0] ? rows[0].base_price : null;
  }
}

module.exports = Service;
