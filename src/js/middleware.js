// require error class
const AppError = require("./appError");
const { logPath } = require("./loggingPath");

// import model/class to make a new mongoose instance
const Campground = require("./models/campground");
// require model/class to make a new review instance
const Review = require("./models/review");

// middleware to see if a user is logged in
const isLoggedIn = (req, res, next) => {
  const { id } = req.params;
  if (!req.isAuthenticated()) {
    // store the url they are requesting before
    // console.log(req.path, req.originalUrl);
    logPath(req.user, __filename);
    req.session.returnTo =
      req.query._method === "DELETE" || Object.keys(req.body).length
        ? `/campgrounds/${id}`
        : req.originalUrl;
    req.flash("error", "you must sign in first");
    return res.redirect("/login");
  }
  next();
};

// middleware for validate camp
function validateFormData(req, res, next, validation) {
  // validate the data
  const { error } = validation.validate(req.body);
  // and check if there's an error object inside the returned validation data
  if (error) {
    // if there's only one error in the details array
    // const errMessage = validate.error.details[0].message;
    // else
    const errMessage = error.details.map((obj) => obj.message).join(",");
    throw new AppError(errMessage, 400);
  } else {
    next();
  }
}

async function isAuthor(req, res, next) {
  const { id } = req.params;
  // first find the campground with the id from the params
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "campground not found");
    return res.redirect("/campgrounds");
  }
  // than check if the author of the camp is same with the logged in user
  if (!camp.author._id.equals(req.user._id)) {
    req.flash("error", "you don't have permission for that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

async function isAuthorRev(req, res, next) {
  const { id, reviewId } = req.params;
  // first find the campground with the id from the params
  const rev = await Review.findById(reviewId);
  if (!rev) {
    req.flash("error", "review not found");
    return res.redirect(`/campgrounds/${reviewId}`);
  }
  // than check if the author of the camp is same with the logged in user
  if (!rev.user._id.equals(req.user._id)) {
    req.flash("error", "you don't have permission for that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
// function validateReviewData(req, res, next) {
//   //validate the data
//   const { error } = reviewSchema.validate(req.body);
//   // and check if there's an error object inside the returned validation data
//   if (error) {
//     const errMessage = error.details.map((obj) => obj.message).join(",");
//     throw new AppError(errMessage, 400);
//   } else {
//     next();
//   }
// }

module.exports = { isLoggedIn, validateFormData, isAuthor, isAuthorRev };
