const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });

// import model/class to make a new mongoose instance
const Review = require("../models/review");
// import model/class to make a new mongoose instance
const Campground = require("../models/campground");
// require error wrapper
const catchAsync = require("../catchAsync");
// require Joi validation schema for campground
const { reviewSchema } = require("../validation/validation-schema-joi");
// require custom middleware
const { isLoggedIn, validateFormData, isAuthorRev } = require("../middleware");

// controller
const reviewController = require("../controllers/reviews");

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

  // delete a review
  router.delete(
    "/:reviewId",
    isLoggedIn,
    isAuthorRev,
    catchAsync(reviewController.deleteReview)
  );

  router.post(
    "/",
    isLoggedIn,
    (req, res, next) => {
      validateFormData(req, res, next, reviewSchema);
    },
    catchAsync(reviewController.createReview)
  );
}

module.exports = router;
