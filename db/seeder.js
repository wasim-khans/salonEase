#!/usr/bin/env node

// Database seeder with random data generation
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MYSQL_HOST', 'DB_PORT', 'MYSQL_ROOT_USER', 'MYSQL_ROOT_PASSWORD', 'MYSQL_DATABASE', 'DB_CONTAINER'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('Please check your .env file');
  process.exit(1);
}

const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.DB_PORT,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

const containerName = process.env.DB_CONTAINER;

// Data generators
const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Wilson', 'Davis', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
const domains = ['email.com', 'gmail.com', 'yahoo.com', 'outlook.com'];

const services = [
  { name: 'Haircut', category: 'male', base_price: 25.00, duration: 30 },
  { name: 'Beard Trim', category: 'male', base_price: 15.00, duration: 15 },
  { name: 'Hair Coloring', category: 'female', base_price: 80.00, duration: 120 },
  { name: 'Hair Styling', category: 'female', base_price: 45.00, duration: 60 },
  { name: 'Manicure', category: 'female', base_price: 30.00, duration: 45 },
  { name: 'Pedicure', category: 'female', base_price: 40.00, duration: 60 },
  { name: 'Facial Treatment', category: 'both', base_price: 60.00, duration: 90 },
  { name: 'Hair Wash & Blow Dry', category: 'both', base_price: 35.00, duration: 45 }
];

function generateUsers(count) {
  const users = [];
  const roles = ['customer', 'customer', 'customer', 'staff', 'staff', 'admin'];
  const genders = ['male', 'female'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    
    users.push({
      id: uuidv4(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      password: '$2b$10$placeholder_hash',
      role: role,
      gender: gender
    });
  }
  
  return users;
}

function generateServices() {
  return services.map(service => ({
    ...service,
    id: uuidv4()
  }));
}

function generateAppointments(users, services, count) {
  const appointments = [];
  const statuses = ['in_review', 'confirmed', 'confirmed', 'completed', 'cancelled'];
  const staffGenders = ['male', 'female', 'any'];
  const adminUser = users.find(u => u.role === 'admin');
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const staff = users.filter(u => u.role === 'staff')[Math.floor(Math.random() * 2)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date(2024, 0, 15 + Math.floor(Math.random() * 10));
    const time = `${9 + Math.floor(Math.random() * 10)}:${Math.random() > 0.5 ? '00' : '30'}:00`;
    
    const appointment = {
      id: uuidv4(),
      user_id: user.id,
      appointment_date: date.toISOString().split('T')[0],
      preferred_time: time,
      preferred_staff_gender: staffGenders[Math.floor(Math.random() * staffGenders.length)],
      status: status,
      staff_id: status !== 'in_review' && status !== 'cancelled' ? staff.id : null,
      service_provided_by: status === 'completed' ? staff.id : null,
      cancelled_by: status === 'cancelled' ? 'customer' : null,
      cancellation_reason: status === 'cancelled' ? 'Schedule conflict' : null,
      actual_price: status === 'completed' ? 35.00 : null,
      admin_notes: null,
      confirmed_at: status === 'confirmed' || status === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
      completed_by: status === 'completed' && adminUser ? adminUser.id : null,
      created_at: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    appointments.push(appointment);
  }
  
  return appointments;
}

function generateAppointmentServices(appointments, services) {
  const appointmentServices = [];
  
  appointments.forEach(appointment => {
    const numServices = Math.floor(Math.random() * 2) + 1; // 1-2 services per appointment
    const selectedServices = [];
    
    for (let i = 0; i < numServices; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      if (!selectedServices.find(s => s.id === service.id)) {
        selectedServices.push(service);
        
        appointmentServices.push({
          id: uuidv4(),
          appointment_id: appointment.id,
          service_id: service.id,
          price: service.base_price
        });
      }
    }
  });
  
  return appointmentServices;
}

async function seedDatabase() {
  try {
    console.log('Generating seed data...');
    
    const users = generateUsers(6);
    const serviceList = generateServices();
    const appointments = generateAppointments(users, serviceList, 5);
    const appointmentServices = generateAppointmentServices(appointments, serviceList);
    
    // Build SQL statements
    const userValues = users.map(user => 
      `('${user.id}', '${user.name}', '${user.email}', '${user.password}', '${user.role}', '${user.gender}')`
    ).join(',');
    
    const serviceValues = serviceList.map(service => 
      `('${service.id}', '${service.name}', '${service.category}', ${service.base_price}, ${service.duration})`
    ).join(',');
    
    const appointmentValues = appointments.map(appointment => {
      const values = [
        `'${appointment.id}'`,
        `'${appointment.user_id}'`,
        `'${appointment.appointment_date}'`,
        `'${appointment.preferred_time}'`,
        `'${appointment.preferred_staff_gender}'`,
        `'${appointment.status}'`,
        appointment.staff_id ? `'${appointment.staff_id}'` : 'NULL',
        appointment.service_provided_by ? `'${appointment.service_provided_by}'` : 'NULL',
        appointment.cancelled_by ? `'${appointment.cancelled_by}'` : 'NULL',
        appointment.cancellation_reason ? `'${appointment.cancellation_reason}'` : 'NULL',
        appointment.actual_price ? appointment.actual_price : 'NULL',
        appointment.admin_notes ? `'${appointment.admin_notes}'` : 'NULL',
        appointment.confirmed_at ? `'${appointment.confirmed_at}'` : 'NULL',
        appointment.completed_by ? `'${appointment.completed_by}'` : 'NULL',
        `'${appointment.created_at}'`,
        `'${appointment.updated_at}'`
      ];
      return `(${values.join(', ')})`;
    }).join(',');
    
    const appointmentServiceValues = appointmentServices.map(as => 
      `('${as.id}', '${as.appointment_id}', '${as.service_id}', ${as.price})`
    ).join(',');
    
    const sql = `INSERT INTO users (id, name, email, password, role, gender) VALUES ${userValues}; INSERT INTO services (id, name, category, base_price, duration) VALUES ${serviceValues}; INSERT INTO appointments (id, user_id, appointment_date, preferred_time, preferred_staff_gender, status, staff_id, service_provided_by, cancelled_by, cancellation_reason, actual_price, admin_notes, confirmed_at, completed_by, created_at, updated_at) VALUES ${appointmentValues}; INSERT INTO appointment_services (id, appointment_id, service_id, price) VALUES ${appointmentServiceValues}; SELECT 'Users:' as table_name, COUNT(*) as record_count FROM users UNION ALL SELECT 'Services:', COUNT(*) FROM services UNION ALL SELECT 'Appointments:', COUNT(*) FROM appointments UNION ALL SELECT 'Appointment Services:', COUNT(*) FROM appointment_services;`;

    console.log('Executing seed SQL...');
    const command = `docker exec -i ${containerName} mysql -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} -e "${sql}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('Error:', stderr);
      process.exit(1);
    }
    
    console.log(stdout);
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
