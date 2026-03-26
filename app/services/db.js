// SalonEase Database Connection
// MySQL connection setup using mysql2

require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: {
    host: process.env.MYSQL_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
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