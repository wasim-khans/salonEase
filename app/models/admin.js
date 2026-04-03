const db = require('../services/db');

const Admin = {
    async findByEmail(email) {
        const [rows] = await db.pool.execute(
            `SELECT * FROM admins WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    async findByEmailOrPhone(email, phone) {
        const [rows] = await db.pool.execute(
            `SELECT id FROM admins WHERE email = ? OR phone = ?`,
            [email, phone]
        );
        return rows[0];
    },

    async findById(adminId) {
        const [rows] = await db.pool.execute(
            `SELECT id, name, email, phone, created_at FROM admins WHERE id = ?`,
            [adminId]
        );
        return rows[0];
    },

    async create(adminData) {
        const { name, email, phone, password } = adminData;
        
        const [result] = await db.pool.execute(
            `INSERT INTO admins (name, email, phone, password) 
            VALUES (?, ?, ?, ?)`,
            [name, email, phone, password]
        );
        
        return result.insertId;
    },

    async update(adminId, adminData) {
        const fields = [];
        const values = [];

        if (adminData.name !== undefined) {
            fields.push('name = ?');
            values.push(adminData.name);
        }

        if (adminData.email !== undefined) {
            fields.push('email = ?');
            values.push(adminData.email);
        }

        if (adminData.phone !== undefined) {
            fields.push('phone = ?');
            values.push(adminData.phone);
        }

        if (adminData.password !== undefined) {
            fields.push('password = ?');
            values.push(adminData.password);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(adminId);

        const [result] = await db.pool.execute(
            `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    },

    async delete(adminId) {
        const [result] = await db.pool.execute(
            `DELETE FROM admins WHERE id = ?`,
            [adminId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Admin;
