const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const nameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const Name = mongoose.model("Name", nameSchema);

module.exports = { User, Name };
