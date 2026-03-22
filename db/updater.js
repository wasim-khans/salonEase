#!/usr/bin/env node

// Database schema updater - recreates schema (destructive)
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
const fs = require('fs').promises;

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.DB_PORT,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

const containerName = process.env.DB_CONTAINER;

async function updateSchema() {
  try {
    console.log('⚠️  WARNING: This will delete all data and recreate the schema!');
    
    // Drop all tables and recreate schema
    console.log('Updating schema...');
    const fs = require('fs').promises;
    const schemaPath = `${__dirname}/schema.sql`;
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Remove USE statement and combine with DROP
    const cleanSchema = schemaSQL.replace(/CREATE DATABASE.*?USE.*?;/s, '').trim();
    const sql = `DROP TABLE IF EXISTS appointment_services, appointments, services, users; ${cleanSchema}`;

    console.log('Executing schema update...');
    const command = `docker exec -i ${containerName} mysql -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} -e "${sql}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('Error:', stderr);
      process.exit(1);
    }
    
    console.log(stdout);
    console.log('✅ Schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateSchema();
}

module.exports = { updateSchema };
