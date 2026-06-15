const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  teacherName: { type: String, required: true },
  department: { type: String, required: true },
  className: { type: String, required: true },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);