const DButils = require("./DButils");
const recipe_utils = require("./recipes_utils");

/**
 * Adds a recipe to the user's favorite recipes list in the database.
 * 
 * @param user_id - The ID of the user.
 * @param recipe - The recipe object to be added to favorites.
 * @param recipe.id - The ID of the recipe.
 * @param recipe.title - The title of the recipe.
 * @param recipe.image - The image URL of the recipe.
 * @param recipe.readyInMinutes - Preparation time in minutes.
 * @param recipe.vegetarian - Whether the recipe is vegetarian.
 * @param recipe.vegan - Whether the recipe is vegan.
 * @param recipe.glutenFree - Whether the recipe is gluten-free.
 * @param recipe.extendedIngredients - List of ingredients.
 * @param recipe.analyzedInstructions - Step-by-step instructions.
 * @param recipe.aggregateLikes - The number of likes the recipe has received.
 * @param recipe.sourceName - The name of the source where the recipe is from.
 * @param recipe.sourceUrl - The URL of the source where the recipe is from.
 * 
 * @throws Will throw an error if any required field is missing or invalid.
 */
  
async function addFavoriteRecipe(user_id, recipe) {
  if (!user_id ) {
    throw new Error("Invalid or missing user_id");
}
  const { 
      id, 
      title, 
      image, 
      readyInMinutes, 
      vegetarian, 
      vegan, 
      glutenFree, 
      extendedIngredients, 
      analyzedInstructions, 
      aggregateLikes, 
      sourceName, 
      sourceUrl 
  } = recipe;

  await DButils.execQuery(
      `INSERT INTO FavoriteRecipes 
      (user_id, recipe_id, title, image, readyInMinutes, vegetarian, vegan, glutenFree, 
      extendedIngredients, analyzedInstructions, aggregateLikes, sourceName, sourceUrl) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, id, title, image, readyInMinutes, vegetarian, vegan, glutenFree, 
       JSON.stringify(extendedIngredients), JSON.stringify(analyzedInstructions), aggregateLikes, sourceName, sourceUrl]
  );
}

/**
 * Retrieves the favorite recipes of a specific user from the database.
 * 
 * @param user_id - The ID of the user.
 * 
 * @returns - An array of recipe objects.
 * 
 * @throws Will throw an error if user_id is invalid.
 */

async function getFavoriteRecipes(user_id) {
  if (!user_id ) {
    throw new Error("Invalid or missing user_id");
}
  const recipes = await DButils.execQuery(
      `SELECT recipe_id, title, image, readyInMinutes, vegetarian, vegan, glutenFree, 
              extendedIngredients, analyzedInstructions, aggregateLikes, sourceName, sourceUrl 
       FROM FavoriteRecipes WHERE user_id = ?`,
      [user_id]
  );

  return recipes.map(recipe => ({
      ...recipe,
      extendedIngredients: JSON.parse(recipe.extendedIngredients),
      analyzedInstructions: JSON.parse(recipe.analyzedInstructions)
  }));
}



module.exports = { addFavoriteRecipe, getFavoriteRecipes };
