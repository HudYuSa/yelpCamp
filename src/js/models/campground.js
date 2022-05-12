// initialize mongoose
const mongoose = require("mongoose");
const { campgroundSchema } = require("../validation/validation-schema-joi");
const Review = require("./review");
const { Schema, model } = mongoose;

// thit is an option to let virtual to make inside the json object
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
  url: String,
  filename: String,
});
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
const campSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [imageSchema],
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  opts
);
campSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <h3 class="font-bold text-red-200">${this.title}</h3>
  <a href="/campgrounds/${this._id}">visit campground</a>
  `;
});

campSchema.pre("findOneAndDelete", async function (data) {
  console.log("pre delete middleware");
});

campSchema.post("findOneAndDelete", async function (deletedData) {
  const { reviews } = deletedData;
  // console.log(data);
  if (reviews.length) {
    const res = await Review.deleteMany({ _id: { $in: reviews } });
    console.log(res);
  }
});

// export the model to make a new variable as a model
module.exports = model("Campground", campSchema);
