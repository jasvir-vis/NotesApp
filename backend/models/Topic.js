const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  topicName: {
    type: String,
    required: true,
    trim: true
  },

  // 🔥 Optional reference for dropdown
  topicMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TopicMaster"
  },

  fileUrl: {
    type: String,
    required: true
  },

  fileType: String,

  views: {
    type: Number,
    default: 0
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  }

}, { timestamps: true });

module.exports = mongoose.model("Topic", topicSchema);