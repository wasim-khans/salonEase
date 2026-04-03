const db = require('../services/db');

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
            `SELECT id, name, email, phone, gender, created_at FROM staff ORDER BY name`
        );
        return rows;
    },

    async getByGender(gender) {
        const [rows] = await db.pool.execute(
            `SELECT id, name, email, phone, gender, created_at FROM staff WHERE gender = ? ORDER BY name`,
            [gender]
        );
        return rows;
    },

    async create(staffData) {
        const { name, email, phone, password, gender } = staffData;
        
        const [result] = await db.pool.execute(
            `INSERT INTO staff (name, email, phone, password, gender) 
            VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, password, gender]
        );
        
        return result.insertId;
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

        if (staffData.password !== undefined) {
            fields.push('password = ?');
            values.push(staffData.password);
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
            `DELETE FROM staff WHERE id = ?`,
            [staffId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Staff;
