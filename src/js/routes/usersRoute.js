const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });

// import model/class to make a new mongoose instance
const User = require("../models/user");
// require error class
const AppError = require("../appError");
// require error wrapper
const catchAsync = require("../catchAsync");
// require Joi validation schema for campground
// const { userSchema } = require("../validation/validation-schema-joi");
// require passport for authentication
const passport = require("passport");

const userController = require("../controllers/users");

//! ==================================
//! run main function and detect error
main().catch((err) => console.log(err));
//! ==================================
//! main function
async function main() {
  // parse data from a form
  app.use(express.urlencoded({ extended: true }));
  // parse data from a json file
  app.use(express.json());

  // methods can be combine if it have the same route
  router
    .route("/register")
    .get(userController.registerForm)
    .post(catchAsync(userController.register));

  router
    .route("/login")
    .get(userController.loginForm)
    .post(
      passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
      }),
      userController.login
    );

  router.get("/logout", userController.logout);
}

module.exports = router;
