const mysql = require('mysql2/promise');
const fs = require('fs');
require("dotenv").config();

// Database connection configuration
const config = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};

// Function to insert family recipes into the database
const insertFamilyRecipes = async (connection, recipes) => {
  const query = 'INSERT INTO family_recipes (name, character_name, occasion, image, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?)';
  
  for (const recipe of recipes) {
    const values = [
      recipe.name,
      recipe.character,
      recipe.occasion,
      recipe.image,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.instructions)
    ];
    await connection.query(query, values);
    console.log(`Inserted recipe: ${recipe.name}`);
  }
};

const main = async () => {
  // Create a connection to the database
  const connection = await mysql.createConnection(config);

  try {
    // Read the JSON file containing the recipes data
    const recipesData = JSON.parse(fs.readFileSync('file.json', 'utf-8'));

    // Insert the data into the family_recipes table
    await insertFamilyRecipes(connection, recipesData);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the database connection
    await connection.end();
  }
};

main();
