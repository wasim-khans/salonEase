// SalonEase Database Connection
// MySQL connection setup using mysql2

require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_USER || 'salonease_user',
    password: process.env.MYSQL_PASS || 'salonease123',
    database: process.env.MYSQL_DATABASE || 'salonease_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
};
  
const pool = mysql.createPool(config.db);

// Utility function to query the database
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  query,
  pool
}