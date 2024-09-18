var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

/**
 * Basic route to check if the server is running.
 */
router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching recipes.
 * 
 * Query Parameters:
 * - query: Search term for the recipe name.
 * - cuisine: (optional) Cuisine type to filter.
 * - diet: (optional) Diet type to filter.
 * - intolerance: (optional) Intolerance to filter.
 * - number: (optional) Number of results to return (default is 5).
 * 
 * Example: /search?query=pasta&cuisine=Italian&diet=Vegetarian
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.query;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    // Validate required parameters
    if (!recipeName) {
      return res.status(400).send({ message: "Search query (recipe name) is required" });
    }

    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.send(results);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns 3 random recipes from an external API.
 */

router.get("/random", async (req, res, next) => {
  try {
    const results = await recipes_utils.getRandomRecipes(3);
    res.send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns details of a specific recipe by its ID.
 * 
 * Query Parameters:
 * - source: Specify whether to fetch the recipe from 'api' or 'db'.
 * 
 */

router.get("/:recipeId", async (req, res, next) => {
  try {
    const source = req.query.source ;
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId, source);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns full details of a recipe by its ID.
 * 
 * URL Parameter:
 * - recipeId: The unique ID of the recipe to fetch.
 * 
 * Example: /full/12345
 */
router.get("/full/:recipeId", async (req, res, next) => {
  try {

    const recipeId = parseInt(req.params.recipeId);

    // Validate recipe ID
    if (isNaN(recipeId)) {
      return res.status(400).send({ message: "Invalid recipe ID" });
    }
    
    const recipe = await recipes_utils.getFullRecipeDetails(req.params.recipeId);
    res.send({ data: recipe });
  } catch (error) {
    console.error("Error fetching full recipe details:", error);
    res.status(500).send({ error: "Failed to fetch full recipe details" });
  }
});



module.exports = router;
