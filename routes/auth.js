var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      profilePic: req.body.profilePic || null
    }

    // Check if passwords match
    if (user_details.password !== req.body.password_confirmation) {
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

router.post("/Login", async (req, res, next) => {
  try {
     // Ensure username and password are provided
     if (!req.body.username || !req.body.password) {
      throw { status: 400, message: "Username and Password required" };
    }
    
    // Check if username exists
    const users = await DButils.execQuery("SELECT * FROM users WHERE username = ?", [req.body.username]);
    if (users.length === 0) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;


    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;