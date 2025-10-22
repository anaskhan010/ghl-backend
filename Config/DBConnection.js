const mysql = require('mysql2/promise');

const dbConfig = {
  host: '37.27.187.4',
  user: 'root',
  password: 'l51Qh6kM2vb3npALukrKNMzNAlBogTj0NSH4Gd3IxqMfaP0qfFkp54e7jcknqGNX',
  database: 'ghl_integration_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = mysql.createPool(dbConfig);

module.exports = db;
