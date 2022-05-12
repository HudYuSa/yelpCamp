const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
// using passport-loca-mongoose we just need to plugin the schema with only email inside it,
// passport will automatically adding username field and password field
userSchema.plugin(passportLocalMongoose);

module.exports = model("User", userSchema);
