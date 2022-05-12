// import model/class to make a new mongoose instance
const User = require("../models/user");
const passport = require("passport");

module.exports.registerForm = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body.user;
    const user = new User({ email: email, username: username });
    await user.setPassword(password);
    await user.save();
    // const registeredUser = await User.register(user, password);
    // use login function that are provided by passport
    req.login(user, (err) => {
      if (err) return next(err);
    });
    req.flash("success", "Welcome to Yelp Camp!");
    res.redirect("/campgrounds");
  } catch (err) {
    req.flash("error", "username have been used ");
    res.redirect("/register");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  if (req.session.returnTo) {
    const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    req.flash("success", "successfully log in");
    return res.redirect(redirectUrl);
  }
  req.flash("success", "welcome back!");
  res.redirect("/campgrounds");
};

module.exports.logout = (req, res, next) => {
  // passport logout function
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/campgrounds");
};
