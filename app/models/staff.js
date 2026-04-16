const db = require('../services/db');
const { v4: uuidv4 } = require('uuid');

const Staff = {
    async findByEmail(email) {
        const [rows] = await db.pool.execute(
            `SELECT * FROM staff WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    async findByEmailOrPhone(email, phone) {
        const [rows] = await db.pool.execute(
            `SELECT id FROM staff WHERE email = ? OR phone = ?`,
            [email, phone]
        );
        return rows[0];
    },

    async findById(staffId) {
        const [rows] = await db.pool.execute(
            `SELECT id, name, email, phone, gender, created_at FROM staff WHERE id = ?`,
            [staffId]
        );
        return rows[0];
    },

    async getAll() {
        const [rows] = await db.pool.execute(
            `SELECT id, name, email, phone, gender, is_active, created_at FROM staff WHERE is_active = TRUE ORDER BY name`
        );
        return rows;
    },

    async getByGender(gender) {
        const [rows] = await db.pool.execute(
            `SELECT id, name, email, phone, gender, created_at FROM staff WHERE gender = ? AND is_active = TRUE ORDER BY name`,
            [gender]
        );
        return rows;
    },

    async create(staffData) {
        const { name, email, phone, gender } = staffData;
        
        const id = uuidv4();
        
        await db.pool.execute(
            `INSERT INTO staff (id, name, email, phone, gender) 
            VALUES (?, ?, ?, ?, ?)`,
            [id, name, email, phone, gender]
        );
        
        return id;
    },

    async update(staffId, staffData) {
        const fields = [];
        const values = [];

        if (staffData.name !== undefined) {
            fields.push('name = ?');
            values.push(staffData.name);
        }

        if (staffData.email !== undefined) {
            fields.push('email = ?');
            values.push(staffData.email);
        }

        if (staffData.phone !== undefined) {
            fields.push('phone = ?');
            values.push(staffData.phone);
        }

        if (staffData.gender !== undefined) {
            fields.push('gender = ?');
            values.push(staffData.gender);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(staffId);

        const [result] = await db.pool.execute(
            `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    },

    async delete(staffId) {
        const [result] = await db.pool.execute(
            `UPDATE staff SET is_active = FALSE WHERE id = ?`,
            [staffId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Staff;
