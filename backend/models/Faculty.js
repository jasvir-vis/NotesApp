const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  facultyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true
  },

  isApproved: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Faculty", facultySchema);