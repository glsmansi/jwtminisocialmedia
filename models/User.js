const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  token: {
    type: String,
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model("User", UserSchema);
