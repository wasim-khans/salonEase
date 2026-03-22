// AppointmentServiceMap Model - Database access layer for appointment_services table
const db = require('../services/db');

class AppointmentServiceMap {
  // Add service to appointment
  static async addService(appointmentId, serviceId, price) {
    const [result] = await db.query(
      `INSERT INTO appointment_services (appointment_id, service_id, price) VALUES (?, ?, ?)`,
      [appointmentId, serviceId, price]
    );
    return result.insertId;
  }

  // Get services for a specific appointment
  static async findByAppointmentId(appointmentId) {
    const [rows] = await db.query(
      `SELECT as.*, s.name as service_name, s.category, s.duration 
       FROM appointment_services as 
       JOIN services s ON as.service_id = s.id 
       WHERE as.appointment_id = ?`,
      [appointmentId]
    );
    return rows;
  }

  // Remove service from appointment
  static async removeService(appointmentId, serviceId) {
    const [result] = await db.query(
      `DELETE FROM appointment_services WHERE appointment_id = ? AND service_id = ?`,
      [appointmentId, serviceId]
    );
    return result.affectedRows > 0;
  }

  // Update service price in appointment
  static async updatePrice(appointmentId, serviceId, newPrice) {
    const [result] = await db.query(
      `UPDATE appointment_services SET price = ? WHERE appointment_id = ? AND service_id = ?`,
      [newPrice, appointmentId, serviceId]
    );
    return result.affectedRows > 0;
  }

  // Delete all services for an appointment
  static async deleteByAppointmentId(appointmentId) {
    const [result] = await db.query(
      `DELETE FROM appointment_services WHERE appointment_id = ?`,
      [appointmentId]
    );
    return result.affectedRows > 0;
  }

  // Get service details for appointment
  static async getServiceDetails(appointmentId) {
    const [rows] = await db.query(
      `SELECT as.id, as.price, s.name, s.category, s.base_price, s.duration 
       FROM appointment_services as 
       JOIN services s ON as.service_id = s.id 
       WHERE as.appointment_id = ?`,
      [appointmentId]
    );
    return rows;
  }
}

module.exports = AppointmentServiceMap;
