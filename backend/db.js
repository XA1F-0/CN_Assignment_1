// Connects Node.js to MySQL using the values in the .env file.
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  dateStrings: true, // return DATE columns as "YYYY-MM-DD" text
});

module.exports = pool;
