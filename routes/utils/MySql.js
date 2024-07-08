var mysql = require('mysql2/promise');
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.host || "localhost",
  user: process.env.user || "root",
  password: process.env.password || "syny97Kan!",
  database: process.env.database || "recipe_db"
};

const pool = mysql.createPool(config);

const connection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return connection.query(sql, binding);
    };
    const release = () => {
      connection.release();
      console.log("MySQL pool released: threadId " + connection.threadId);
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
