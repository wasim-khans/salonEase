#!/usr/bin/env node

// Simple Dynamic Seeder - Works reliably with schema changes
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { promisify } = require('util');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const execAsync = promisify(exec);

const containerName = 'salonease-salonease-db-1';

// Data generators
const generators = {
  firstNames: ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria'],
  lastNames: ['Smith', 'Johnson', 'Wilson', 'Davis', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'],
  domains: ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com'],
  
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  randomPhone() {
    return `+1${this.randomInt(100, 999)}${this.randomInt(100, 999)}${this.randomInt(1000, 9999)}`;
  },
  
  randomEmail(firstName, lastName, domain) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${this.randomInt(1, 99)}@${domain}`;
  }
};

class SmartSeeder {
  constructor() {
    this.tableDefinitions = new Map();
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'salonease-db',
      user: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'salonease_db'
    });
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Smart Database Seeder...');
      
      // Connect to database
      await this.connect();
      
      // Define table structures based on schema
      this.defineTableStructures();
      
      // Generate data
      console.log('📊 Generating realistic test data...');
      
      const customers = await this.generateCustomers(8);
      const admins = await this.generateAdmins(2);
      const staff = await this.generateStaff(4);
      const services = this.generateServices();
      const appointments = this.generateAppointments(customers, staff, 12);
      const appointmentServices = this.generateAppointmentServices(appointments, services);
      
      // Clear existing data
      await this.clearDatabase();
      
      // Insert data
      console.log('🔧 Inserting data into database...');
      
      await this.insertData('customers', customers);
      await this.insertData('admins', admins);
      await this.insertData('staff', staff);
      await this.insertData('services', services);
      await this.insertData('appointments', appointments);
      await this.insertData('appointment_services', appointmentServices);
      
      // Show results
      await this.showResults();
      
      console.log('✅ Smart seeding completed successfully!');
      console.log('🎯 Update defineTableStructures() when schema changes!');
      
    } catch (error) {
      console.error('❌ Error during seeding:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  defineTableStructures() {
    // Define table structures - update when schema changes
    this.tableDefinitions.set('customers', {
      columns: ['id', 'name', 'email', 'phone', 'password', 'gender', 'created_at']
    });
    
    this.tableDefinitions.set('admins', {
      columns: ['id', 'name', 'email', 'phone', 'password', 'created_at']
    });
    
    this.tableDefinitions.set('staff', {
      columns: ['id', 'name', 'email', 'phone', 'password', 'gender', 'created_at']
    });
    
    this.tableDefinitions.set('services', {
      columns: ['id', 'name', 'category', 'base_price', 'duration', 'created_at']
    });
    
    this.tableDefinitions.set('appointments', {
      columns: ['id', 'customer_id', 'appointment_date', 'preferred_time', 'preferred_staff_gender', 'status', 'staff_id', 'cancelled_by', 'cancellation_reason', 'actual_price', 'admin_notes', 'confirmed_at', 'completed_by', 'created_at', 'updated_at']
    });
    
    this.tableDefinitions.set('appointment_services', {
      columns: ['id', 'appointment_id', 'service_id', 'price']
    });
    
    console.log(`📋 Defined ${this.tableDefinitions.size} table structures`);
  }

  async generateCustomers(count) {
    const customers = [];
    const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
    const passwordHash = await bcrypt.hash('test123', 10);
    
    for (let i = 0; i < count; i++) {
      const firstName = generators.randomChoice(generators.firstNames);
      const lastName = generators.randomChoice(generators.lastNames);
      
      customers.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: `customer${i + 1}@gmail.com`,
        phone: generators.randomPhone(),
        password: passwordHash,
        gender: generators.randomChoice(genders),
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    }
    
    console.log(`✨ Generated ${count} customers`);
    return customers;
  }

  async generateAdmins(count) {
    const admins = [];
    const passwordHash = await bcrypt.hash('test123', 10);
    
    for (let i = 0; i < count; i++) {
      const firstName = generators.randomChoice(generators.firstNames);
      const lastName = generators.randomChoice(generators.lastNames);
      
      admins.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: `admin${i + 1}@gmail.com`,
        phone: generators.randomPhone(),
        password: passwordHash,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    }
    
    console.log(`✨ Generated ${count} admins`);
    return admins;
  }

  async generateStaff(count) {
    const staff = [];
    const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
    const passwordHash = await bcrypt.hash('test123', 10);
    
    for (let i = 0; i < count; i++) {
      const firstName = generators.randomChoice(generators.firstNames);
      const lastName = generators.randomChoice(generators.lastNames);
      
      staff.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@salonease.com`,
        phone: generators.randomPhone(),
        password: passwordHash,
        gender: generators.randomChoice(genders),
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    }
    
    console.log(`✨ Generated ${count} staff members`);
    return staff;
  }

  generateServices() {
    const services = [
      { id: uuidv4(), name: 'Haircut', category: 'male', base_price: 25.00, duration: 30, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Beard Trim', category: 'male', base_price: 15.00, duration: 15, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Hair Coloring', category: 'female', base_price: 80.00, duration: 120, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Hair Styling', category: 'female', base_price: 45.00, duration: 60, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Manicure', category: 'female', base_price: 30.00, duration: 45, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Pedicure', category: 'female', base_price: 40.00, duration: 60, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Facial Treatment', category: 'both', base_price: 60.00, duration: 90, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: uuidv4(), name: 'Hair Wash & Blow Dry', category: 'both', base_price: 35.00, duration: 45, created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') }
    ];
    
    console.log(`✨ Generated ${services.length} services`);
    return services;
  }

  generateAppointments(customers, staff, count) {
    const appointments = [];
    const statuses = ['in_review', 'confirmed', 'completed', 'cancelled', 'no_show'];
    const staffGenders = ['male', 'female', 'any'];
    
    for (let i = 0; i < count; i++) {
      const customer = generators.randomChoice(customers);
      const staffMember = generators.randomChoice(staff);
      const status = generators.randomChoice(statuses);
      
      const appointment = {
        id: uuidv4(),
        customer_id: customer.id,
        appointment_date: new Date(Date.now() - generators.randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time: `${generators.randomInt(9, 18)}:${generators.randomChoice(['00', '30'])}:00`,
        preferred_staff_gender: generators.randomChoice(staffGenders),
        status: status,
        staff_id: (status !== 'in_review' && status !== 'cancelled' && status !== 'no_show') ? staffMember.id : null,
        cancelled_by: status === 'cancelled' ? 'customer' : null,
        cancellation_reason: status === 'cancelled' ? 'Schedule conflict' : null,
        actual_price: status === 'completed' ? generators.randomInt(25, 80) : null,
        admin_notes: null,
        confirmed_at: (status === 'confirmed' || status === 'completed') ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
        completed_by: status === 'completed' ? staffMember.id : null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      appointments.push(appointment);
    }
    
    console.log(`✨ Generated ${appointments.length} appointments`);
    return appointments;
  }

  generateAppointmentServices(appointments, services) {
    const appointmentServices = [];
    
    appointments.forEach(appointment => {
      const numServices = generators.randomInt(1, 2);
      for (let i = 0; i < numServices; i++) {
        const service = generators.randomChoice(services);
        appointmentServices.push({
          id: uuidv4(),
          appointment_id: appointment.id,
          service_id: service.id,
          price: service.base_price
        });
      }
    });
    
    console.log(`✨ Generated ${appointmentServices.length} appointment-service mappings`);
    return appointmentServices;
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    const tables = ['appointment_services', 'appointments', 'customers', 'admins', 'staff', 'services'];
    
    for (const table of tables) {
      try {
        await this.connection.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${table}: ${error.message}`);
      }
    }
  }

  async insertData(tableName, records) {
    if (!records || records.length === 0) return;
    
    const tableDef = this.tableDefinitions.get(tableName);
    if (!tableDef) return;
    
    const columns = tableDef.columns;
    const columnNames = columns.join(', ');
    
    const values = records.map(record => {
      const vals = columns.map(col => {
        const value = record[col];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
        if (typeof value === 'number') return value.toString();
        return `'${value}'`;
      });
      return `(${vals.join(', ')})`;
    }).join(',');
    
    const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES ${values};`;
    
    try {
      await this.connection.execute(sql);
      console.log(`✅ Inserted ${records.length} records into ${tableName}`);
    } catch (error) {
      console.log(`⚠️  Could not insert into ${tableName}: ${error.message}`);
    }
  }

  async showResults() {
    const tables = ['customers', 'admins', 'staff', 'services', 'appointments', 'appointment_services'];
    
    console.log('\n📊 Seeding Results:');
    for (const table of tables) {
      try {
        const [rows] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`   ${table}: ${count} records`);
      } catch (error) {
        console.log(`   ${table}: Not found`);
      }
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new SmartSeeder();
  seeder.run().catch(error => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  });
}

module.exports = { SmartSeeder };
