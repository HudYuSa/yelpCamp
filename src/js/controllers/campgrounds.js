// import model/class to make a new mongoose instance
const { logPath } = require("../loggingPath");
const Campground = require("../models/campground");

//require mapbox to get location
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/campgrounds", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/newCamp");
};

module.exports.createNewCamp = async (req, res) => {
  // getting coordinate of a location
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const newCamp = new Campground(req.body.campground);
  newCamp.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  newCamp.geometry = geoData.body.features[0].geometry;
  newCamp.author = req.user._id;
  logPath(newCamp, __filename);
  await newCamp.save();
  console.log(newCamp);
  req.flash("success", "Successfully made a new campgrond");
  res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.campDetails = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id)
    //make a nested populate inside the reviews
    .populate({
      path: "reviews",
      populate: {
        path: "user",
      },
    })
    .populate("author");

  //or find the review instance and then
  // get user detail from review
  // const reviewsId = camp.reviews.map((obj) => obj._id);
  // const reviews = await Review.find({
  //   _id: { $in: reviewsId },
  // }).populate("user");
  // // make a new array of the user for each review
  const users = camp.reviews.map((obj) => obj.user);

  if (!camp) {
    req.flash("error", "there are no camp with that id");
    res.redirect("/campgrounds");
  } else {
    res.render("campgrounds/detail", {
      camp,
      id,
      reviews: camp.reviews,
      author: camp.author,
      users: users,
    });
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  res.render("campgrounds/edit", { camp, id });
};

module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campData = { ...req.body.campground };
  const campground = await Campground.findByIdAndUpdate(id, campData);
  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    //delete selectted img from the cloudinary storage
    for (filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // delete selected img from the campground database
    const updatedCamp = await campground.updateOne(
      {
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      },
      { new: true }
    );
    console.log(updatedCamp);
  }
  req.flash("success", "sucessfully edited the campground");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "sucessfully deleted the campground");
  res.redirect("/campgrounds");
};
