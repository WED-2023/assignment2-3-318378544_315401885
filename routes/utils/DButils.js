require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query, params) {
  let returnValue = [];
  const connection = await MySql.connection();
    try {
    const [rows] = await connection.query(query, params);
    //await connection.query("START TRANSACTION");
    returnValue = rows;
  } catch (err) {
    //await connection.query("ROLLBACK");
    console.log('Error executing query: ', err);
    throw err;
  } finally {
    await connection.release();
  }
  return returnValue
}

