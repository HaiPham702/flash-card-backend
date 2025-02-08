"use strict";

var mongoose = require("mongoose");

// Định nghĩa Schema cho User
var UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  age: { type: Number },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Tạo model User từ schema
var User = mongoose.model("User", UserSchema);

module.exports = User;