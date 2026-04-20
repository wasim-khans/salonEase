const db = require('../services/db');

class Customer {
    constructor() {
        this.pool = db.pool;
    }

    async findByEmail(email) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM customers WHERE email = ?`,
            [email]
        );
        return rows[0];
    }

    async findByPhone(phone) {
        const [rows] = await this.pool.execute(
            `SELECT id FROM customers WHERE phone = ?`,
            [phone]
        );
        return rows[0];
    }

    async findByEmailOrPhone(email, phone) {
        const [rows] = await this.pool.execute(
            `SELECT id FROM customers WHERE email = ? OR phone = ?`,
            [email, phone]
        );
        return rows[0];
    }

    async findById(customerId) {
        const [rows] = await this.pool.execute(
            `SELECT id, name, email, phone, gender, created_at FROM customers WHERE id = ?`,
            [customerId]
        );
        return rows[0];
    }

    async create(customerData) {
        const { name, email, phone, password, gender } = customerData;
        
        const [result] = await this.pool.execute(
            `INSERT INTO customers (name, email, phone, password, gender) 
            VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, password, gender]
        );
        
        return result.insertId;
    }

    async update(customerId, customerData) {
        const fields = [];
        const values = [];

        if (customerData.name !== undefined) {
            fields.push('name = ?');
            values.push(customerData.name);
        }

        if (customerData.email !== undefined) {
            fields.push('email = ?');
            values.push(customerData.email);
        }

        if (customerData.phone !== undefined) {
            fields.push('phone = ?');
            values.push(customerData.phone);
        }

        if (customerData.password !== undefined) {
            fields.push('password = ?');
            values.push(customerData.password);
        }

        if (customerData.gender !== undefined) {
            fields.push('gender = ?');
            values.push(customerData.gender);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(customerId);

        const [result] = await this.pool.execute(
            `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(customerId) {
        const [result] = await this.pool.execute(
            `DELETE FROM customers WHERE id = ?`,
            [customerId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new Customer();
