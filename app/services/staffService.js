// SalonEase Staff Service
// Staff-related business logic

const Staff = require('../models/staff');

const getAllStaff = async () => {
    try {
        const staff = await Staff.getAll();
        return { success: true, staff };
    } catch (error) {
        return { success: false, message: 'Failed to fetch staff', error: error.message };
    }
};

const createStaff = async (data) => {
    try {
        const { name, email, phone, gender } = data;
        if (!name || !email || !phone || !gender) {
            return { success: false, message: 'All fields are required (name, email, phone, gender)' };
        }

        const existing = await Staff.findByEmailOrPhone(email, phone);
        if (existing) {
            return { success: false, message: 'A staff member with that email or phone already exists' };
        }

        const id = await Staff.create({ name, email, phone, gender });
        return { success: true, message: 'Staff member created', id };
    } catch (error) {
        return { success: false, message: 'Failed to create staff member', error: error.message };
    }
};

const updateStaff = async (id, data) => {
    try {
        const staff = await Staff.findById(id);
        if (!staff) {
            return { success: false, message: 'Staff member not found' };
        }

        const updated = await Staff.update(id, data);
        if (!updated) {
            return { success: false, message: 'No changes were made' };
        }
        return { success: true, message: 'Staff member updated' };
    } catch (error) {
        return { success: false, message: 'Failed to update staff member', error: error.message };
    }
};

const deleteStaff = async (id) => {
    try {
        const deleted = await Staff.delete(id);
        if (!deleted) {
            return { success: false, message: 'Staff member not found' };
        }
        return { success: true, message: 'Staff member deactivated' };
    } catch (error) {
        return { success: false, message: 'Failed to delete staff member', error: error.message };
    }
};

module.exports = {
    getAllStaff,
    createStaff,
    updateStaff,
    deleteStaff
};
