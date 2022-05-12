if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// initialize express
const express = require("express");
const app = express();

// using atlas for global database service
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpCamp";

// require path
const path = require("path");
// use ejs mate for making ejs layout
const ejsMate = require("ejs-mate");
// initialize mongoose
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
//require morgan for logging route method
// var logger = require("morgan");
// require method override
const methodOverride = require("method-override");
// require error class
const AppError = require("./appError");
// require async function wrapper
const catchAsync = require("./catchAsync");
// require session for storing data in server-side
const session = require("express-session");
// require flash for popup message that stored inside the session
const flash = require("connect-flash");
// require passport for creating strategy for authentication
const passport = require("passport");
// require passport-local to implement local strategy
const localStrategy = require("passport-local");
const { logPath } = require("./loggingPath");
// express mongo sanitize to remove invalid character from mongo query
const mongoSanitize = require("express-mongo-sanitize");
// helmet to secure express apps by setting varoius http heaeders.
const helmet = require("helmet");
// connect-mongo to store express session inside a mongo database
const MongoStore = require("connect-mongo");

// models
const User = require("./models/user");

//? require all router
// campground related route
const campgroundsRoute = require("./routes/campgroundsRoute");
// reviews related route
const reviewsRoute = require("./routes/reviewsRoute");
const usersRoute = require("./routes/usersRoute");
const { func } = require("joi");

// console.log(path.resolve(__dirname, "../../dist/views"));
//! ==================================
//! run main function and detect error
main().catch((err) => console.log(err));
//! ==================================
//! main function
async function main() {
  // connect to the database
  // mongoose.connect("mongodb://localhost:27017/yelpCamp", {
  mongoose.connect(dbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  // use ejs-locals for all ejs templates:
  app.engine("ejs", ejsMate);

  // set view engine for ejs
  app.set("view engine", "ejs");
  // set path to the views directory
  app.set("views", path.resolve(__dirname, "../../dist/views"));

  // session secret
  const secret = process.env.SECRET || "reallysecret";

  const store = MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/yelpCamp",
    secret: secret,
    touchAfter: 24 * 3600,
  });

  store.on("error", function () {
    console.log("session store error");
  });

  // using session
  app.use(
    session({
      store: store,
      name: "session",
      secret: secret,
      resave: false,
      saveUninitialized: true,
      // secure:true,
      cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week
        // secure: true,
        httpOnly: true,
      },
    })
  );

  // flash middleware
  app.use(flash());

  app.use(passport.initialize());
  // app.use passport.session need to be bellow the app.use session
  app.use(passport.session());
  // use static authenticate method of model in LocalStrategy
  // passport.use(new localStrategy(User.authenticate()));
  passport.use(User.createStrategy());
  // use static serialize and deserialize of model for passport session support
  // serialize is how to store user in the session
  passport.serializeUser(User.serializeUser());
  // deserailize is how to get user from the session
  passport.deserializeUser(User.deserializeUser());

  // parse data from a form
  app.use(express.urlencoded({ extended: true }));
  // parse data from a json file
  app.use(express.json());
  //use method override to override a form request action
  app.use(methodOverride("_method"));

  // use morgan logger
  // app.use(logger("tiny"));

  // to serve a static files use the express.static(built-in middleware function in express)
  // serve the distribution file to the server
  app.use(express.static(path.resolve(__dirname, "../../dist")));

  // use mongo sanitize and replace invalid query
  app.use(
    mongoSanitize({
      replaceWith: "_",
    })
  );
  const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
  ];
  const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
  ];
  const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://ka-f.fontawesome.com/",
  ];
  const fontSrcUrls = ["https://kit.fontawesome.com/91131540a2.js"];
  // use helmet to create various headers
  app.use(
    helmet({
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "*.fontawesome.com"],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dejga8gdb/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
            "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
        },
      },
    })
  );

  // locals variables
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    // console.log(req.user);
    next();
  });

  //! all routes
  // get home page
  app.get("/", (req, res) => {
    res.render("home");
  });
  //? campgrounds related routes
  app.use("/campgrounds", campgroundsRoute);
  // ? reviews related routes
  app.use("/campgrounds/:id/reviews", reviewsRoute);
  // ? users related routes
  app.use("/", usersRoute);

  // if there no route with all method
  app.all("*", (req, res, next) => {
    next(new AppError("Page Not Found", 404));
  });
  // error handling for monggose error
  app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === "ValidationError") err = handleValidationErr(err);
    next(err);
  });
  // custom  error handling class
  app.use((err, req, res, next) => {
    const { statusCode = 500, message = "something went wrong" } = err;
    // console.log(message);
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error", { err });
  });
}

function handleValidationErr(err) {
  console.log(err);
  return new AppError(`Validation failed...${err.message}`, 400);
}

app.listen(3000, () => {
  console.log("listening on port 3000");
});
