const mysql = require("mysql2/promise");
const config = require("../config/config.json");

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
});

module.exports = pool;
