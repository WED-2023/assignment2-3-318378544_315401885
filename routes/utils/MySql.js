var mysql = require('mysql2/promise');
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};

const pool = mysql.createPool(config);

const connection = async () => {
  try {
    const connection = await pool.getConnection();
    //console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return connection.query(sql, binding);
    };
    const release = () => {
      connection.release();
      //console.log("MySQL pool released: threadId " + connection.threadId);
    };
    return { query, release };
  } catch (err) {
    console.error("MySQL connection error: ", err);
    throw err;
  }
};

const query = (sql, binding) => {
  return pool.query(sql, binding);
};

module.exports = { pool, connection, query };
