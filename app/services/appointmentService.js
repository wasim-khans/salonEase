// Appointment Service - Business logic for appointment operations
const Appointment = require('../models/appointment');
const AppointmentServiceMap = require('../models/appointmentServiceMap');
const Service = require('../models/service');
const User = require('../models/user');

class AppointmentService {
  // Create new appointment
  static async createAppointment(appointmentData) {
    try {
      return await Appointment.create(appointmentData);
    } catch (error) {
      throw new Error(`Appointment creation failed: ${error.message}`);
    }
  }

  // Get appointment by ID with user details
  static async getAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findByIdWithUser(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      return appointment;
    } catch (error) {
      throw new Error(`Failed to get appointment: ${error.message}`);
    }
  }

  // Get appointments by user
  static async getUserAppointments(userId) {
    try {
      return await Appointment.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get user appointments: ${error.message}`);
    }
  }

  // Get appointments by status (for admin)
  static async getAppointmentsByStatus(status) {
    try {
      return await Appointment.findByStatus(status);
    } catch (error) {
      throw new Error(`Failed to get appointments by status: ${error.message}`);
    }
  }

  // Update appointment
  static async updateAppointment(appointmentId, appointmentData) {
    try {
      const updated = await Appointment.update(appointmentId, appointmentData);
      if (!updated) {
        throw new Error('Failed to update appointment');
      }
      
      return { message: 'Appointment updated successfully' };
    } catch (error) {
      throw new Error(`Appointment update failed: ${error.message}`);
    }
  }

  // Confirm appointment (admin action)
  static async confirmAppointment(appointmentId, staffId, confirmedAt, startTime) {
    try {
      const confirmed = await Appointment.confirm(appointmentId, staffId, confirmedAt, startTime);
      if (!confirmed) {
        throw new Error('Failed to confirm appointment');
      }
      
      return { message: 'Appointment confirmed successfully' };
    } catch (error) {
      throw new Error(`Appointment confirmation failed: ${error.message}`);
    }
  }

  // Complete appointment (admin action)
  static async completeAppointment(appointmentId, actualPrice, serviceProvidedBy, completedBy, adminNotes) {
    try {
      const completed = await Appointment.complete(appointmentId, actualPrice, serviceProvidedBy, completedBy, adminNotes);
      if (!completed) {
        throw new Error('Failed to complete appointment');
      }
      
      return { message: 'Appointment completed successfully' };
    } catch (error) {
      throw new Error(`Appointment completion failed: ${error.message}`);
    }
  }

  // Cancel appointment
  static async cancelAppointment(appointmentId, cancelledBy, cancellationReason) {
    try {
      const cancelled = await Appointment.cancel(appointmentId, cancelledBy, cancellationReason);
      if (!cancelled) {
        throw new Error('Failed to cancel appointment');
      }
      
      return { message: 'Appointment cancelled successfully' };
    } catch (error) {
      throw new Error(`Appointment cancellation failed: ${error.message}`);
    }
  }

  // Delete appointment (admin only)
  static async deleteAppointment(appointmentId) {
    try {
      const deleted = await Appointment.delete(appointmentId);
      if (!deleted) {
        throw new Error('Failed to delete appointment');
      }
      
      return { message: 'Appointment deleted successfully' };
    } catch (error) {
      throw new Error(`Appointment deletion failed: ${error.message}`);
    }
  }

  // Add services to appointment
  static async addServicesToAppointment(appointmentId, services) {
    try {
      const results = [];
      for (const service of services) {
        const result = await AppointmentServiceMap.addService(appointmentId, service.id, service.price);
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to add services to appointment: ${error.message}`);
    }
  }

  // Get services for appointment
  static async getAppointmentServices(appointmentId) {
    try {
      return await AppointmentServiceMap.findByAppointmentId(appointmentId);
    } catch (error) {
      throw new Error(`Failed to get appointment services: ${error.message}`);
    }
  }

  // Remove service from appointment
  static async removeServiceFromAppointment(appointmentId, serviceId) {
    try {
      const removed = await AppointmentServiceMap.removeService(appointmentId, serviceId);
      if (!removed) {
        throw new Error('Failed to remove service from appointment');
      }
      
      return { message: 'Service removed from appointment successfully' };
    } catch (error) {
      throw new Error(`Failed to remove service from appointment: ${error.message}`);
    }
  }

  // Create appointment with services
  static async createAppointmentWithServices(appointmentData, services) {
    try {
      // Create appointment first
      const appointmentId = await Appointment.create(appointmentData);
      
      // Then add services
      const serviceResults = [];
      for (const service of services) {
        const result = await AppointmentServiceMap.addService(appointmentId, service.id, service.price);
        serviceResults.push(result);
      }
      
      return { appointmentId, services: serviceResults };
    } catch (error) {
      throw new Error(`Failed to create appointment with services: ${error.message}`);
    }
  }

  // Calculate estimated cost for appointment
  static async calculateEstimatedCost(serviceIds) {
    try {
      let totalCost = 0;
      for (const serviceId of serviceIds) {
        const price = await Service.getPrice(serviceId);
        if (price !== null) {
          totalCost += price;
        }
      }
      return totalCost;
    } catch (error) {
      throw new Error(`Failed to calculate estimated cost: ${error.message}`);
    }
  }

  // Validate appointment data
  static validateAppointmentData(appointmentData) {
    const { user_id, appointment_date, preferred_time, preferred_staff_gender } = appointmentData;
    
    if (!user_id) {
      throw new Error('User ID is required');
    }
    
    if (!appointment_date) {
      throw new Error('Appointment date is required');
    }
    
    if (!preferred_time) {
      throw new Error('Preferred time is required');
    }
    
    if (!['male', 'female', 'any'].includes(preferred_staff_gender)) {
      throw new Error('Invalid staff gender preference');
    }
    
    // Validate date format and future date
    const appointmentDate = new Date(appointment_date);
    const today = new Date();
    if (appointmentDate <= today) {
      throw new Error('Appointment date must be in the future');
    }
    
    return true;
  }

  // Get available staff for assignment
  static async getAvailableStaff() {
    try {
      return await User.getStaff();
    } catch (error) {
      throw new Error(`Failed to get available staff: ${error.message}`);
    }
  }
}

module.exports = AppointmentService;
