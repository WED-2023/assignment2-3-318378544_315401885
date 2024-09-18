var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * This route adds a recipe to the user's favorites list.
 * 
 * Request body:
 * - userId: ID of the user adding the favorite recipe.
 * - recipe: Recipe object to be added to the user's favorites.
 * 
 * Response:
 * - 201: Recipe successfully added to favorites.
 * - 400: Missing userId or recipe data.
 * - 500: Internal server error.
 */

router.post('/favorites', async (req, res, next) => {
  try {
    const { userId, recipe } = req.body;

     // Validate input
     if (!userId || !recipe || !recipe.id) {
      return res.status(400).send("Missing userId or recipe data");
    }

    await user_utils.addFavoriteRecipe(userId, recipe);

    res.status(201).send("Recipe added to favorites");
  } catch (error) {
    console.error("Error adding recipe to favorites:", error.message);
    next(error);
  }
});

/**
 * This route allows a user to add a new recipe they created.
 * 
 * Request body:
 * - userId: ID of the user adding the recipe.
 * - title: Title of the recipe.
 * - image: Image URL for the recipe.
 * - readyInMinutes: Time in minutes to prepare the recipe.
 * - vegetarian: Boolean indicating if the recipe is vegetarian.
 * - vegan: Boolean indicating if the recipe is vegan.
 * - glutenFree: Boolean indicating if the recipe is gluten-free.
 * - extendedIngredients: List of ingredients.
 * - analyzedInstructions: List of instructions.
 * - aggregateLikes: (optional) Number of likes the recipe has (default is 0).
 * - sourceName: (optional) Name of the recipe source.
 * - sourceUrl: (optional) URL to the recipe source.
 * 
 * Response:
 * - 201: Recipe successfully added.
 * - 400: Missing required data.
 * - 500: Internal server error.
 */

router.post('/addRecipe', async (req, res, next) => {
  try {
    const {
      userId,
      title,
      image,
      readyInMinutes,
      vegetarian,
      vegan,
      glutenFree,
      extendedIngredients,
      analyzedInstructions,
      aggregateLikes = 0, 
      sourceName = null, 
      sourceUrl = null 
    } = req.body;

    // Validate input
    if (!userId || !title || !image || !readyInMinutes) {
      return res.status(400).send("Missing required data: userId, title, image, or readyInMinutes");
    }

    await DButils.execQuery(
      `INSERT INTO UserRecipes 
      (user_id, title, image, readyInMinutes, vegetarian, vegan, glutenFree, extendedIngredients, analyzedInstructions, aggregateLikes, sourceName, sourceUrl) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, image, readyInMinutes, vegetarian, vegan, glutenFree, JSON.stringify(extendedIngredients), JSON.stringify(analyzedInstructions), aggregateLikes, sourceName, sourceUrl]
    );

    res.status(201).send("Recipe added successfully");
  } catch (error) {
    console.error("Error adding new recipe:", error.message);
    next(error);
  }
});


/**
 * This route retrieves all recipes created by the user.
 * 
 * Query parameters:
 * - userId: ID of the user whose recipes are to be fetched.
 * 
 * Response:
 * - 200: Successfully retrieved user recipes.
 * - 400: Missing userId.
 * - 500: Internal server error.
 */

router.get('/myRecipes', async (req, res, next) => {
  try {
    const { userId } = req.query;

    // Validate input
    if (!userId) {
      return res.status(400).send("Missing userId");
    }

    const recipes = await DButils.execQuery(
      `SELECT * FROM UserRecipes WHERE user_id = ?`,
      [userId]
    );

    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    next(error);
  }
});


/**
 * This route retrieves the details of a specific recipe created by the user.
 * 
 * URL parameter:
 * - recipeId: ID of the recipe to be fetched.
 * 
 * Response:
 * - 200: Successfully retrieved recipe details.
 * - 404: Recipe not found.
 * - 500: Internal server error.
 */

router.get('/recipes/:recipeId', async (req, res, next) => {
  try {
    const recipeId = req.params.recipeId;
    const recipe = await recipe_utils.getUserRecipeDetails(recipeId);
    
    // Validate input
    if (!recipe) {
      res.status(404).send("Recipe not found");
      return;
    }
    res.status(200).send({ recipe });
  } catch (error) {
    console.error("Error fetching user recipe details:", error);
    next(error);
  }
});



/**
 * This route retrieves all favorite recipes of the user.
 * 
 * Query parameters:
 * - userId: ID of the user whose favorite recipes are to be fetched.
 * 
 * Response:
 * - 200: Successfully retrieved favorite recipes.
 * - 400: Missing userId.
 * - 500: Internal server error.
 */

router.get('/favorites', async (req, res, next) => {
  try {
    const { userId } = req.query; 
    
    // Validate input
    if (!userId) {
      return res.status(400).send("Missing userId");
    }
    
    const favorites = await user_utils.getFavoriteRecipes(userId);
    res.status(200).send(favorites);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
