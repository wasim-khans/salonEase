const db = require('./db');
const Appointment = require('../models/appointment');
const AppointmentServiceMap = require('../models/appointmentServiceMap');

const createAppointment = async (appointmentData) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { services, ...appointmentFields } = appointmentData;
        
        const appointmentId = await Appointment.create(connection, appointmentFields);
        
        await AppointmentServiceMap.addServices(connection, appointmentId, services);
        
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
