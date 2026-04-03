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

module.exports = {
    getAllStaff
};
