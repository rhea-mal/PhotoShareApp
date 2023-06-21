"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,
  password: String, //new added
  login_name: String, //new added
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }], 
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
