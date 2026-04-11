// SalonEase Service Service
// Service CRUD business logic

const Service = require('../models/service');

const getAllServices = async () => {
    try {
        const services = await Service.getAll();
        return { success: true, services };
    } catch (error) {
        return { success: false, message: 'Failed to fetch services', error: error.message };
    }
};

const getServicesByCategory = async (category) => {
    try {
        if (!['male', 'female', 'both'].includes(category)) {
            return { success: false, message: 'Invalid category. Must be male, female, or both' };
        }
        const services = await Service.getByCategory(category);
        return { success: true, services };
    } catch (error) {
        return { success: false, message: 'Failed to fetch services by category', error: error.message };
    }
};

const getServiceById = async (serviceId) => {
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return { success: false, message: 'Service not found' };
        }
        return { success: true, service };
    } catch (error) {
        return { success: false, message: 'Failed to fetch service', error: error.message };
    }
};

const createService = async (data) => {
    try {
        const { name, category, base_price, duration } = data;
        if (!name || !category || !base_price || !duration) {
            return { success: false, message: 'All fields are required (name, category, base_price, duration)' };
        }
        if (!['male', 'female', 'both'].includes(category)) {
            return { success: false, message: 'Invalid category. Must be male, female, or both' };
        }
        
        const id = await Service.create({ name, category, base_price, duration });
        return { success: true, message: 'Service created', id };
    } catch (error) {
        return { success: false, message: 'Failed to create service', error: error.message };
    }
};

const updateService = async (id, data) => {
    try {
        const service = await Service.findById(id);
        if (!service) {
            return { success: false, message: 'Service not found' };
        }

        if (data.category && !['male', 'female', 'both'].includes(data.category)) {
            return { success: false, message: 'Invalid category. Must be male, female, or both' };
        }

        const updated = await Service.update(id, data);
        if (!updated) {
            return { success: false, message: 'No changes were made' };
        }
        return { success: true, message: 'Service updated' };
    } catch (error) {
        return { success: false, message: 'Failed to update service', error: error.message };
    }
};

module.exports = {
    getAllServices,
    getServicesByCategory,
    getServiceById
};
