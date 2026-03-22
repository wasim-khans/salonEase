// Service Management Service - Business logic for service operations
const Service = require('../models/service');

class ServiceService {
  // Create new service
  static async createService(serviceData) {
    try {
      return await Service.create(serviceData);
    } catch (error) {
      throw new Error(`Service creation failed: ${error.message}`);
    }
  }

  // Get all services
  static async getAllServices() {
    try {
      return await Service.getAll();
    } catch (error) {
      throw new Error(`Failed to get services: ${error.message}`);
    }
  }

  // Get service by ID
  static async getService(serviceId) {
    try {
      const service = await Service.findById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      return service;
    } catch (error) {
      throw new Error(`Failed to get service: ${error.message}`);
    }
  }

  // Get services by category
  static async getServicesByCategory(category) {
    try {
      return await Service.getByCategory(category);
    } catch (error) {
      throw new Error(`Failed to get services by category: ${error.message}`);
    }
  }

  // Get services for specific gender
  static async getServicesForGender(gender) {
    try {
      return await Service.getForGender(gender);
    } catch (error) {
      throw new Error(`Failed to get services for gender: ${error.message}`);
    }
  }

  // Update service
  static async updateService(serviceId, serviceData) {
    try {
      const updated = await Service.update(serviceId, serviceData);
      if (!updated) {
        throw new Error('Failed to update service');
      }
      
      return { message: 'Service updated successfully' };
    } catch (error) {
      throw new Error(`Service update failed: ${error.message}`);
    }
  }

  // Delete service
  static async deleteService(serviceId) {
    try {
      const deleted = await Service.delete(serviceId);
      if (!deleted) {
        throw new Error('Failed to delete service');
      }
      
      return { message: 'Service deleted successfully' };
    } catch (error) {
      throw new Error(`Service deletion failed: ${error.message}`);
    }
  }

  // Get service price for booking
  static async getServicePrice(serviceId) {
    try {
      const price = await Service.getPrice(serviceId);
      if (price === null) {
        throw new Error('Service not found');
      }
      return price;
    } catch (error) {
      throw new Error(`Failed to get service price: ${error.message}`);
    }
  }

  // Get available services for customer booking
  static async getAvailableServices(gender = null) {
    try {
      if (gender) {
        return await Service.getForGender(gender);
      }
      return await Service.getAll();
    } catch (error) {
      throw new Error(`Failed to get available services: ${error.message}`);
    }
  }

  // Validate service data
  static validateServiceData(serviceData) {
    const { name, category, base_price, duration } = serviceData;
    
    if (!name || name.trim() === '') {
      throw new Error('Service name is required');
    }
    
    if (!category || !['male', 'female', 'both'].includes(category)) {
      throw new Error('Invalid service category');
    }
    
    if (!base_price || base_price <= 0) {
      throw new Error('Service price must be greater than 0');
    }
    
    if (!duration || duration <= 0) {
      throw new Error('Service duration must be greater than 0');
    }
    
    return true;
  }
}

module.exports = ServiceService;
