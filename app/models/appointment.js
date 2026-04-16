const db = require('../services/db');
const { v4: uuidv4 } = require('uuid');

class Appointment {
    constructor() {
        this.pool = db.pool;
    }

    async create(connection, appointmentData) {
        const { 
            customer_id, 
            appointment_date, 
            preferred_time, 
            preferred_staff_gender = 'any'
        } = appointmentData;
        
        const id = uuidv4();
        
        await connection.execute(
            `INSERT INTO appointments 
            (id, customer_id, appointment_date, preferred_time, preferred_staff_gender, status) 
            VALUES (?, ?, ?, ?, ?, 'in_review')`,
            [id, customer_id, appointment_date, preferred_time, preferred_staff_gender]
        );
        
        return id;
    }

    async findById(appointmentId) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM appointments WHERE id = ?`,
            [appointmentId]
        );
        return rows[0];
    }

    async findByCustomerId(customerId) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM appointments WHERE customer_id = ? ORDER BY appointment_date DESC`,
            [customerId]
        );
        return rows;
    }

    async findByStatus(status) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM appointments WHERE status = ? ORDER BY appointment_date ASC`,
            [status]
        );
        return rows;
    }

    async updateStatus(appointmentId, status, additionalData = {}) {
        const fields = ['status = ?'];
        const values = [status];

        if (additionalData.staff_id) {
            fields.push('staff_id = ?');
            values.push(additionalData.staff_id);
        }

        if (additionalData.start_time) {
            fields.push('start_time = ?');
            values.push(additionalData.start_time);
        }

        if (additionalData.actual_price) {
            fields.push('actual_price = ?');
            values.push(additionalData.actual_price);
        }

        if (additionalData.admin_notes) {
            fields.push('admin_notes = ?');
            values.push(additionalData.admin_notes);
        }

        if (status === 'confirmed') {
            fields.push('confirmed_at = NOW()');
        }

        if (additionalData.completed_by) {
            fields.push('completed_by = ?');
            values.push(additionalData.completed_by);
        }

        if (additionalData.cancelled_by) {
            fields.push('cancelled_by = ?');
            values.push(additionalData.cancelled_by);
        }

        if (additionalData.cancellation_reason) {
            fields.push('cancellation_reason = ?');
            values.push(additionalData.cancellation_reason);
        }

        values.push(appointmentId);

        const [result] = await this.pool.execute(
            `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(appointmentId) {
        const [result] = await this.pool.execute(
            `DELETE FROM appointments WHERE id = ?`,
            [appointmentId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new Appointment();
