// SalonEase Appointment Service
// Booking, confirm, cancel, complete logic

const db = require('./db');

// Create a new appointment with services
const createAppointment = async (appointmentData) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { 
            customer_id, 
            appointment_date, 
            preferred_time, 
            preferred_staff_gender = 'any',
            services // Array of { service_id, price }
        } = appointmentData;
        
        // 1. Insert into appointments table
        const [appointmentResult] = await connection.execute(
            `INSERT INTO appointments 
            (customer_id, appointment_date, preferred_time, preferred_staff_gender, status) 
            VALUES (?, ?, ?, ?, 'in_review')`,
            [customer_id, appointment_date, preferred_time, preferred_staff_gender]
        );
        
        const appointmentId = appointmentResult.insertId;
        
        // 2. Insert into appointment_services table (one row per service)
        if (services && services.length > 0) {
            for (const service of services) {
                await connection.execute(
                    `INSERT INTO appointment_services 
                    (appointment_id, service_id, price) 
                    VALUES (?, ?, ?)`,
                    [appointmentId, service.service_id, service.price]
                );
            }
        }
        
        await connection.commit();
        
        return {
            success: true,
            message: 'Appointment created successfully',
            appointment_id: appointmentId
        };
        
    } catch (error) {
        await connection.rollback();
        return {
            success: false,
            message: 'Failed to create appointment',
            error: error.message
        };
    } finally {
        connection.release();
    }
};

module.exports = {
    createAppointment
};
