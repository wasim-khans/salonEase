const db = require('./db');
const Appointment = require('../models/appointment');
const AppointmentServiceMap = require('../models/appointmentServiceMap');

const createAppointment = async (appointmentData) => {
    const connection = await db.pool.getConnection();

    try {
        // Validate that the appointment date is not in the past
        if (appointmentData.appointment_date) {
            const appointmentDate = new Date(appointmentData.appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            appointmentDate.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                return {
                    success: false,
                    message: 'Cannot book appointments in the past. Please select a future date.'
                };
            }
        }

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

const editAppointment = async (appointmentId, customerId, updateData) => {
    const { appointment_date, preferred_time, preferred_staff_gender, services } = updateData;

    try {
        // Validate that the appointment date is not in the past
        if (appointment_date) {
            const appointmentDate = new Date(appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            appointmentDate.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                return {
                    success: false,
                    message: 'Cannot book appointments in the past. Please select a future date.'
                };
            }
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return { success: false, message: 'Appointment not found' };
        }

        if (appointment.customer_id !== customerId) {
            return { success: false, message: 'You can only edit your own appointments' };
        }

        if (appointment.status !== 'in_review') {
            return { success: false, message: 'Only appointments in review can be edited' };
        }

        if (!services || services.length === 0) {
            return { success: false, message: 'At least one service is required' };
        }

        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(
                `UPDATE appointments SET appointment_date = ?, preferred_time = ?, preferred_staff_gender = ? WHERE id = ?`,
                [appointment_date, preferred_time, preferred_staff_gender || 'any', appointmentId]
            );

            await connection.execute(
                `DELETE FROM appointment_services WHERE appointment_id = ?`,
                [appointmentId]
            );

            await AppointmentServiceMap.addServices(connection, appointmentId, services);

            await connection.commit();
        } catch (txError) {
            await connection.rollback();
            throw txError;
        } finally {
            connection.release();
        }

        return { success: true, message: 'Appointment updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update appointment', error: error.message };
    }
};

const cancelAppointment = async (appointmentId, cancelledBy, cancellationReason, customerId = null) => {
    try {
        if (!cancellationReason || cancellationReason.trim() === '') {
            return { success: false, message: 'Cancellation reason is required' };
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return { success: false, message: 'Appointment not found' };
        }

        // If customer, verify ownership and allowed statuses
        if (customerId) {
            if (appointment.customer_id !== customerId) {
                return { success: false, message: 'You can only cancel your own appointments' };
            }
            if (!['in_review', 'confirmed'].includes(appointment.status)) {
                return { success: false, message: 'This appointment cannot be cancelled' };
            }
        } else {
            // Admin: cannot cancel completed or already cancelled
            if (appointment.status === 'completed') {
                return { success: false, message: 'Completed appointments cannot be cancelled' };
            }
            if (appointment.status === 'cancelled') {
                return { success: false, message: 'Appointment is already cancelled' };
            }
        }

        const updated = await Appointment.updateStatus(appointmentId, 'cancelled', {
            cancelled_by: cancelledBy,
            cancellation_reason: cancellationReason.trim()
        });

        if (updated) {
            return { success: true, message: 'Appointment cancelled successfully' };
        }
        return { success: false, message: 'Failed to cancel appointment' };
    } catch (error) {
        return { success: false, message: 'Failed to cancel appointment', error: error.message };
    }
};

const getCustomerAppointments = async (customerId) => {
    try {
        const appointments = await Appointment.findByCustomerId(customerId);

        const appointmentsWithServices = await Promise.all(
            appointments.map(async (appt) => {
                const services = await AppointmentServiceMap.findByAppointmentId(appt.id);
                const estimatedTotal = await AppointmentServiceMap.getTotalPrice(appt.id);
                return { ...appt, services, estimated_total: estimatedTotal };
            })
        );

        return { success: true, appointments: appointmentsWithServices };
    } catch (error) {
        return { success: false, message: 'Failed to fetch appointments', error: error.message };
    }
};

const getAllAppointments = async () => {
    try {
        const [appointments] = await db.pool.execute(
            `SELECT a.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
                    s.name as staff_name
             FROM appointments a
             JOIN customers c ON a.customer_id = c.id
             LEFT JOIN staff s ON a.staff_id = s.id
             ORDER BY a.appointment_date DESC`
        );

        const appointmentsWithServices = await Promise.all(
            appointments.map(async (appt) => {
                const services = await AppointmentServiceMap.findByAppointmentId(appt.id);
                const estimatedTotal = await AppointmentServiceMap.getTotalPrice(appt.id);
                return { ...appt, services, estimated_total: estimatedTotal };
            })
        );

        return { success: true, appointments: appointmentsWithServices };
    } catch (error) {
        return { success: false, message: 'Failed to fetch appointments', error: error.message };
    }
};

const confirmAppointment = async (appointmentId, staffId, startTime) => {
    try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return { success: false, message: 'Appointment not found' };
        }

        if (appointment.status !== 'in_review') {
            return { success: false, message: 'Only in-review appointments can be confirmed' };
        }

        if (!staffId) {
            return { success: false, message: 'Staff assignment is required' };
        }

        if (!startTime) {
            return { success: false, message: 'Start time is required' };
        }

        const services = await AppointmentServiceMap.findByAppointmentId(appointmentId);
        if (!services || services.length === 0) {
            return { success: false, message: 'At least one service must be attached' };
        }

        const updated = await Appointment.updateStatus(appointmentId, 'confirmed', {
            staff_id: staffId,
            start_time: startTime
        });

        if (updated) {
            return { success: true, message: 'Appointment confirmed successfully' };
        }
        return { success: false, message: 'Failed to confirm appointment' };
    } catch (error) {
        return { success: false, message: 'Failed to confirm appointment', error: error.message };
    }
};

const completeAppointment = async (appointmentId, actualPrice, completedBy, adminNotes) => {
    try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return { success: false, message: 'Appointment not found' };
        }

        if (appointment.status !== 'confirmed') {
            return { success: false, message: 'Only confirmed appointments can be completed' };
        }

        if (!actualPrice || actualPrice <= 0) {
            return { success: false, message: 'Actual price is required' };
        }

        if (!completedBy) {
            return { success: false, message: 'Service provider (staff) is required' };
        }

        const updated = await Appointment.updateStatus(appointmentId, 'completed', {
            actual_price: actualPrice,
            completed_by: completedBy,
            admin_notes: adminNotes || null
        });

        if (updated) {
            return { success: true, message: 'Appointment marked as completed' };
        }
        return { success: false, message: 'Failed to complete appointment' };
    } catch (error) {
        return { success: false, message: 'Failed to complete appointment', error: error.message };
    }
};

module.exports = {
    createAppointment,
    editAppointment,
    cancelAppointment,
    getCustomerAppointments,
    getAllAppointments,
    confirmAppointment,
    completeAppointment
};
