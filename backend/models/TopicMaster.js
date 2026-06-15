const mongoose = require("mongoose");

const topicMasterSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    unique: true
  },
  topics: [
    {
      type: String,
      trim: true
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("TopicMaster", topicMasterSchema);