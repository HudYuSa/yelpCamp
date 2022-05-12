const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });

// require cloudinary and CloudinaryStorage (from multer-storage-cloudinary)
const { storage } = require("../cloudinary");

//  require multer to parse a file data
const multer = require("multer");
// with this multer the destination for the file is to local upload file
// const upload = multer({ dest: "uploads/" });
//  but we can store the data from multer to a certain storage
const upload = multer({ storage: storage });

const { logPath } = require("../loggingPath");

// import model/class to make a new mongoose instance
const Campground = require("../models/campground");
// require error wrapper
const catchAsync = require("../catchAsync");
// require Joi validation schema for campground
const { campgroundSchema } = require("../validation/validation-schema-joi");
// require custom middleware
const { isLoggedIn, validateFormData, isAuthor } = require("../middleware");

// controller for campground
const campgroundControl = require("../controllers/campgrounds");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

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

  // get all campground
  router
    .route("/")
    .get(catchAsync(campgroundControl.index))
    .post(
      isLoggedIn,
      upload.array("image"),
      (req, res, next) => {
        validateFormData(req, res, next, campgroundSchema);
      },
      catchAsync(campgroundControl.createNewCamp)
    );

  // get form to make a new campground
  router.get("/new", isLoggedIn, campgroundControl.renderNewForm);

  // get form to edit campground
  router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundControl.renderEditForm)
  );

  //post the new campground
  // router.post(
  //   "/",
  //   isLoggedIn,
  //   (req, res, next) => {
  //     validateFormData(req, res, next, campgroundSchema);
  //   },
  //   catchAsync(campgroundControl.createNewCamp)
  // );
  // router.post("/", upload.single("image"), (req, res) => {
  //   console.log(req.body);
  //   res.send(req.file);
  // });

  // methods can be combine if it have the same route
  router
    .route("/:id")
    // get/show campground detail
    .get(catchAsync(campgroundControl.campDetails))
    // update the edit campground
    .put(
      isLoggedIn,
      isAuthor,
      upload.array("image"),
      (req, res, next) => {
        validateFormData(req, res, next, campgroundSchema);
      },
      catchAsync(campgroundControl.updateCamp)
    )
    // delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundControl.deleteCamp));
}

module.exports = router;
