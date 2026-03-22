#!/usr/bin/env node

// Database cleaner - removes all data while preserving structure
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

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');
    
    const sql = `DELETE FROM appointment_services; DELETE FROM appointments; DELETE FROM services; DELETE FROM users; SELECT 'Users:' as table_name, COUNT(*) as record_count FROM users UNION ALL SELECT 'Services:', COUNT(*) FROM services UNION ALL SELECT 'Appointments:', COUNT(*) FROM appointments UNION ALL SELECT 'Appointment Services:', COUNT(*) FROM appointment_services;`;

    console.log('Executing clean SQL...');
    const command = `docker exec -i ${containerName} mysql -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} -e "${sql}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('Error:', stderr);
      process.exit(1);
    }
    
    console.log(stdout);
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase };
