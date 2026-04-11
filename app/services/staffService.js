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
        const { name, email, phone, password, gender } = data;
        if (!name || !email || !phone || !password || !gender) {
            return { success: false, message: 'All fields are required (name, email, phone, password, gender)' };
        }

        const id = await Staff.create({ name, email, phone, password, gender });
        return { success: true, message: 'Staff member created', id };
    } catch (error) {
        return { success: false, message: 'Failed to create staff member', error: error.message };
    }
};

module.exports = {
    getAllStaff
};
