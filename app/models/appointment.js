// Appointment Model - Database access layer for appointments table
const db = require('../services/db');

class Appointment {
  // Create new appointment
  static async create(appointmentData) {
    const { 
      user_id, 
      appointment_date, 
      preferred_time, 
      preferred_staff_gender 
    } = appointmentData;
    
    const [result] = await db.query(
      `INSERT INTO appointments (user_id, appointment_date, preferred_time, preferred_staff_gender, status) 
       VALUES (?, ?, ?, ?, 'in_review')`,
      [user_id, appointment_date, preferred_time, preferred_staff_gender]
    );
    return result.insertId;
  }

  // Find appointment by ID (UUID)
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Get appointments by user ID
  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date DESC`,
      [userId]
    );
    return rows;
  }

  // Get appointments by status
  static async findByStatus(status) {
    const [rows] = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email 
       FROM appointments a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.status = ? 
       ORDER BY a.appointment_date DESC`,
      [status]
    );
    return rows;
  }

  // Update appointment
  static async update(id, appointmentData) {
    const fields = [];
    const values = [];
    
    // Dynamically build update query
    if (appointmentData.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(appointmentData.start_time);
    }
    if (appointmentData.staff_id !== undefined) {
      fields.push('staff_id = ?');
      values.push(appointmentData.staff_id);
    }
    if (appointmentData.status !== undefined) {
      fields.push('status = ?');
      values.push(appointmentData.status);
    }
    if (appointmentData.cancelled_by !== undefined) {
      fields.push('cancelled_by = ?');
      values.push(appointmentData.cancelled_by);
    }
    if (appointmentData.cancellation_reason !== undefined) {
      fields.push('cancellation_reason = ?');
      values.push(appointmentData.cancellation_reason);
    }
    if (appointmentData.actual_price !== undefined) {
      fields.push('actual_price = ?');
      values.push(appointmentData.actual_price);
    }
    if (appointmentData.admin_notes !== undefined) {
      fields.push('admin_notes = ?');
      values.push(appointmentData.admin_notes);
    }
    if (appointmentData.confirmed_at !== undefined) {
      fields.push('confirmed_at = ?');
      values.push(appointmentData.confirmed_at);
    }
    if (appointmentData.service_provided_by !== undefined) {
      fields.push('service_provided_by = ?');
      values.push(appointmentData.service_provided_by);
    }
    if (appointmentData.completed_by !== undefined) {
      fields.push('completed_by = ?');
      values.push(appointmentData.completed_by);
    }
    
    // Always update updated_at
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const [result] = await db.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  }

  // Update appointment status
  static async updateStatus(id, status, additionalData = {}) {
    const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    
    if (additionalData.staff_id !== undefined) {
      fields.push('staff_id = ?');
      values.push(additionalData.staff_id);
    }
    if (additionalData.confirmed_at !== undefined) {
      fields.push('confirmed_at = ?');
      values.push(additionalData.confirmed_at);
    }
    
    const [result] = await db.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  }

  // Confirm appointment (admin action)
  static async confirm(id, staffId, confirmedAt, startTime) {
    const [result] = await db.query(
      `UPDATE appointments SET status = 'confirmed', staff_id = ?, confirmed_at = ?, start_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [staffId, confirmedAt, startTime, id]
    );
    return result.affectedRows > 0;
  }

  // Complete appointment (admin action)
  static async complete(id, actualPrice, serviceProvidedBy, completedBy, adminNotes) {
    const [result] = await db.query(
      `UPDATE appointments SET status = 'completed', actual_price = ?, service_provided_by = ?, completed_by = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [actualPrice, serviceProvidedBy, completedBy, adminNotes, id]
    );
    return result.affectedRows > 0;
  }

  // Cancel appointment
  static async cancel(id, cancelledBy, cancellationReason) {
    const [result] = await db.query(
      `UPDATE appointments SET status = 'cancelled', cancelled_by = ?, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [cancelledBy, cancellationReason, id]
    );
    return result.affectedRows > 0;
  }

  // Delete appointment (admin only)
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM appointments WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get appointment with user details
  static async findByIdWithUser(id) {
    const [rows] = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.gender as user_gender 
       FROM appointments a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = Appointment;
