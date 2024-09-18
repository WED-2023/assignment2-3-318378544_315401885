const axios = require("axios");
const API_URL = "https://api.spoonacular.com/recipes";
require('dotenv').config(); 
const apiKey = process.env.spooncular_apiKey;
const DButils = require("./DButils");

/**
 * Fetches detailed information about a recipe from the external API.
 * @param recipe_id - The ID of the recipe to fetch.
 * @returns - Recipe details from the API.
 * @throws Will throw an error if the fetch fails.
 */

async function getRecipeInformation(recipe_id) {
    if (!recipe_id) {
        throw new Error("Invalid recipe ID");
    }
    try {
        const response = await axios.get(`${API_URL}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching recipe information for ID: ${recipe_id}`, error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
}


/**
 * Fetches recipe details from either the API or the database.
 * @param recipeId - The ID of the recipe to fetch.
 * @param source - The source of the recipe ('api' or 'db').
 * @returns - Recipe details.
 * @throws Will throw an error if the fetch fails or the source is unknown.
 */

async function getRecipeDetails(recipeId, source) {
    if (!recipeId || !['api', 'db'].includes(source)) {
        throw new Error("Invalid parameters for fetching recipe details");
    }
    try {
        if (source === 'api') {
            // API request
            const recipe_info = await getRecipeInformation(recipeId);
            return recipe_info;
        } else if (source === 'db') {
            // DB request
            const response = await DButils.execQuery(`SELECT * FROM recipes WHERE id=${recipeId}`);
            if (response.length === 0) {
                throw new Error("Recipe not found in DB.");
            }
            return response[0]; 
        } else {
            throw new Error("Unknown source");
        }
    } catch (error) {
        console.error("Error fetching recipe details:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
}

/**
 * Searches for recipes based on provided criteria.
 * @param recipeName - The name of the recipe to search for.
 * @param cuisine - The cuisine type to filter by.
 * @param diet - The diet type to filter by.
 * @param intolerance - The intolerance to filter by.
 * @param number - The number of recipes to return.
 * @returns - Array of recipe details.
 * @throws Will throw an error if the search fails.
 */

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    if (!recipeName) {
        throw new Error("Invalid parameters for searching recipes");
    }
    try {
        const response = await axios.get(`${API_URL}/complexSearch`, {
            params: {
                query: recipeName,
                cuisine: cuisine || '',
                diet: diet || '',
                intolerances: intolerance || '',
                number: number,
                apiKey: apiKey
            }
        });

        const recipeDetailsPromises = response.data.results.map(recipe => getRecipeDetails(recipe.id, "api"));
        const recipesDetails = await Promise.all(recipeDetailsPromises);
        return recipesDetails;
    } catch (error) {
        console.error("Error during recipe search:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
}

/**
 * Fetches user-specific recipe details from the database.
 * @param recipeId - The ID of the recipe to fetch.
 * @returns - Recipe details or null if not found.
 * @throws Will throw an error if the fetch fails.
 */

async function getUserRecipeDetails(recipeId) {

    if (!recipeId) {
        throw new Error("Invalid recipe ID");
    }
    try {

        const query = 'SELECT * FROM userrecipes WHERE id = ?';
        const [rows] = await DButils.execQuery(query, [recipeId]);
        
        if (!rows || rows.length === 0) {
            console.error("Recipe not found in DB.");
            return null;
        }

        const recipe = rows;
        recipe.extendedIngredients = JSON.parse(recipe.extendedIngredients || '[]');
        recipe.analyzedInstructions = JSON.parse(recipe.analyzedInstructions || '[]');

        return recipe;
    } catch (error) {
        console.error("Error fetching recipe from DB:", error);
        throw error;
    }
}

/**
 * Fetches full recipe details including additional information from the external API.
 * @param recipe_id - The ID of the recipe.
 * @returns - Full recipe details.
 * @throws Will throw an error if fetching details fails.
 */

async function getFullRecipeDetails(recipe_id) {
    if (!recipe_id) {
        throw new Error("Invalid recipe ID");
    }
    try {
        let recipe_info = await getRecipeInformation(recipe_id);
        if (!recipe_info) {
            throw new Error(`No data found for recipe ID: ${recipe_id}`);
        }

        let {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            extendedIngredients,
            analyzedInstructions,
            sourceName,
            sourceUrl
        } = recipe_info;  


        return {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            extendedIngredients, 
            analyzedInstructions, 
            sourceName, 
            sourceUrl  
        };
    } catch (error) {
        console.error("Error fetching full recipe details from Spoonacular:", error);
        throw error;
    }
}

/**
 * Fetches random recipes from the external API.
 * @param number - The number of random recipes to fetch.
 * @returns - Array of random recipe details.
 * @throws Will throw an error if fetching fails.
 */

async function getRandomRecipes(number) {
    if (!Number.isInteger(number) || number <= 0) {
        throw new Error("Invalid number of recipes requested");
    }
    const response = await axios.get(`${API_URL}/random`, {
        params: {
            number: number,
            apiKey: apiKey
        }
    });
    return response.data.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        image: recipe.image,
        aggregateLikes: recipe.aggregateLikes,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        glutenFree: recipe.glutenFree,
    }));
}


module.exports = { getFullRecipeDetails,getUserRecipeDetails, getRecipeDetails, getRandomRecipes, searchRecipe };
