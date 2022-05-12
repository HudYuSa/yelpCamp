// initialize joi (schema validation package)
// joi will validate the data and based on created joi schema
// if the data pass the validation then it will continue to process to the database
// if not then joi will send an error message
const baseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label} must not include HTML!}',
  },
  rules: {
    escapedHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          AllowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = baseJoi.extend(extension);

const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().min(6).required().escapedHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().min(6).required(),
    description: Joi.string().min(6).required().escapedHTML(),
    location: Joi.string().min(6).required().escapedHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().min(10).required().escapedHTML(),
  }).required(),
});
module.exports = { campgroundSchema, reviewSchema };
