const db = require('../services/db');

const AppointmentServiceMap = {
    async addServices(connection, appointmentId, services) {
        if (!services || services.length === 0) {
            return [];
        }

        const insertedIds = [];
        
        for (const service of services) {
            const [result] = await connection.execute(
                `INSERT INTO appointment_services 
                (appointment_id, service_id, price) 
                VALUES (?, ?, ?)`,
                [appointmentId, service.service_id, service.price]
            );
            insertedIds.push(result.insertId);
        }
        
        return insertedIds;
    },

    async findByAppointmentId(appointmentId) {
        const [rows] = await db.pool.execute(
            `SELECT 
                aps.id,
                aps.appointment_id,
                aps.service_id,
                aps.price,
                s.name as service_name,
                s.category,
                s.duration
            FROM appointment_services aps
            JOIN services s ON aps.service_id = s.id
            WHERE aps.appointment_id = ?`,
            [appointmentId]
        );
        return rows;
    },

    async removeService(appointmentServiceId) {
        const [result] = await db.pool.execute(
            `DELETE FROM appointment_services WHERE id = ?`,
            [appointmentServiceId]
        );
        return result.affectedRows > 0;
    },

    async removeAllByAppointmentId(appointmentId) {
        const [result] = await db.pool.execute(
            `DELETE FROM appointment_services WHERE appointment_id = ?`,
            [appointmentId]
        );
        return result.affectedRows;
    },

    async getTotalPrice(appointmentId) {
        const [rows] = await db.pool.execute(
            `SELECT SUM(price) as total_price 
            FROM appointment_services 
            WHERE appointment_id = ?`,
            [appointmentId]
        );
        return rows[0]?.total_price || 0;
    }
};

module.exports = AppointmentServiceMap;
