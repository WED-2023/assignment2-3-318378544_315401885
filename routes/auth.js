var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

/**
 * Registers a new user in the system.
 * 
 * @param username - The username of the user (3-8 characters, letters/numbers).
 * @param firstname - The first name of the user.
 * @param lastname - The last name of the user.
 * @param country - The country of the user.
 * @param password - The password of the user (5-10 characters, must include at least one number and one special character).
 * @param confirmedPassword - The confirmed password for validation.
 * @param email - The email address of the user.
 * @param [profilePic=null] - Optional profile picture URL.
 * 
 * @throws Will throw an error if validation fails or if the username is already taken.
 */

router.post("/register", async (req, res, next) => {
  try {
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      profilePic: req.body.profilePic || null
    }

    // Validate required fields
    if (!user_details.username || !user_details.firstname || !user_details.lastname || !user_details.country || !user_details.password || !user_details.email) {
      throw { status: 400, message: "All fields are required" };
    }

    // Check if passwords match
    if (user_details.password !== req.body.confirmedPassword) {
      throw { status: 400, message: "Passwords do not match" };
    }

    // Validate username length (3-8 characters)
    if (!/^[a-zA-Z0-9]{3,8}$/.test(user_details.username)) {
      throw { status: 400, message: "Invalid input data" };
    }

    // Validate password length (5-10 characters) and ensure it contains at least one number and one special character
    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,10}$/.test(user_details.password)) {
      throw { status: 400, message: "Invalid input data" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_details.email)) {
      throw { status: 400, message: "Invalid input data" };
    }

    // Check if username already exists in the system
    let users = await DButils.execQuery("SELECT username FROM users WHERE username = ?", [user_details.username]);
    if (users.length > 0) {
      throw { status: 409, message: "Username already taken" };
    }
    

    // add the new username
    // Hash the password
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    // Insert the new user into the database
    await DButils.execQuery(
      `INSERT INTO users (username, firstname, lastname, country, password, email, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_details.username, user_details.firstname, user_details.lastname, user_details.country, hash_password, user_details.email, user_details.profilePic]

    );
    res.status(201).send({ message: "User successfully registered", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Logs in a user by checking username and password.
 * 
 * @param username - The username of the user.
 * @param password - The password of the user.
 * 
 * @returns - The user_id of the logged-in user.
 * 
 * @throws Will throw an error if the username or password is incorrect.
 */

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }
    // Check if the user exists and Check if the password is correct
    const users = await DButils.execQuery("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0 || !bcrypt.compareSync(password, users[0].password)) {
      return res.status(401).send("Username or Password incorrect");
    }

    // Return user_id upon successful login
    const userId = users[0].id;
    res.status(200).send({ message: "login succeeded", user_id: userId });
  } catch (error) {
    next(error);
  }
});



/**
 * Logs out the current user and resets the session.
 */

router.post("/Logout", function (req, res) {
  req.session.reset(); // Reset the session
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;