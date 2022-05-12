const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  // console.log(req.body);
  const { id } = req.params;
  // console.log(id);
  const user = req.user;
  console.log(req.user);
  const { review } = req.body;
  const newRev = new Review({ ...req.body.review });
  newRev.user = user;
  const savedRev = await newRev.save();
  console.log(savedRev);

  await Campground.findByIdAndUpdate(
    id,
    { $push: { reviews: await Review.findOne({ body: review.body }) } },
    { new: true }
  );
  req.flash("success", "review created!!!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId).then((data) => console.log(data));
  res.redirect(`/campgrounds/${id}`);
};
