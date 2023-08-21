const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Standard", "Exclusive"],
    default: "Standard",
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Virtual for full name to display as one string
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName}, ${this.lastName}`;
});

module.exports = mongoose.model("User", UserSchema);
