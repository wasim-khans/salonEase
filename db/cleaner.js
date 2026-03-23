#!/usr/bin/env node

// Database cleaner - removes all data while preserving structure
require('dotenv').config();

const mysql = require('mysql2/promise');

async function cleanDatabase() {
  let connection = null;
  
  try {
    console.log('🧹 Cleaning database...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'salonease-db',
      user: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'salonease_db'
    });
    
    console.log('✅ Connected to database');
    
    // Tables to clean (in order of dependencies)
    const tables = [
      'appointment_services',
      'appointments', 
      'customers',
      'admins',
      'staff',
      'services'
    ];
    
    // Clean each table
    for (const table of tables) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleaned ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not clean ${table}: ${error.message}`);
      }
    }
    
    // Show results
    console.log('\n📊 Cleaning Results:');
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`   ${table}: ${count} records`);
      } catch (error) {
        console.log(`   ${table}: Not found`);
      }
    }
    
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase };
