const db = require('../services/db');

const Service = {
    async getAll() {
        const [rows] = await db.pool.execute(
            `SELECT * FROM services ORDER BY category, name`
        );
        return rows;
    },

    async findById(serviceId) {
        const [rows] = await db.pool.execute(
            `SELECT * FROM services WHERE id = ?`,
            [serviceId]
        );
        return rows[0];
    },

    async findByIds(serviceIds) {
        if (!serviceIds || serviceIds.length === 0) {
            return [];
        }
        
        const placeholders = serviceIds.map(() => '?').join(',');
        const [rows] = await db.pool.execute(
            `SELECT * FROM services WHERE id IN (${placeholders})`,
            serviceIds
        );
        return rows;
    },

    async getByCategory(category) {
        const [rows] = await db.pool.execute(
            `SELECT * FROM services WHERE category = ? OR category = 'both' ORDER BY name`,
            [category]
        );
        return rows;
    },

    async create(serviceData) {
        const { name, category, base_price, duration } = serviceData;
        
        const [result] = await db.pool.execute(
            `INSERT INTO services (name, category, base_price, duration) 
            VALUES (?, ?, ?, ?)`,
            [name, category, base_price, duration]
        );
        
        return result.insertId;
    },

    async update(serviceId, serviceData) {
        const fields = [];
        const values = [];

        if (serviceData.name !== undefined) {
            fields.push('name = ?');
            values.push(serviceData.name);
        }

        if (serviceData.category !== undefined) {
            fields.push('category = ?');
            values.push(serviceData.category);
        }

        if (serviceData.base_price !== undefined) {
            fields.push('base_price = ?');
            values.push(serviceData.base_price);
        }

        if (serviceData.duration !== undefined) {
            fields.push('duration = ?');
            values.push(serviceData.duration);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(serviceId);

        const [result] = await db.pool.execute(
            `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    },

    async delete(serviceId) {
        const [result] = await db.pool.execute(
            `DELETE FROM services WHERE id = ?`,
            [serviceId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Service;
