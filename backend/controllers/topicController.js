const Topic = require("../models/Topic");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const PDFMerger = require("pdf-merger-js").default;


exports.mergeAndDownload = async (req, res) => {
  try {
    const { topicIds } = req.body;

    const topics = await Topic.find({ _id: { $in: topicIds } });

    const merger = new PDFMerger();

    let added = 0;

    for (let topic of topics) {
      // 🔥 FIX PATH
      const filePath = path.join(
        __dirname,
        "..",
        topic.fileUrl.replace("/", "")
      );

      console.log("Checking:", filePath);

      // ❌ Skip non-pdf
      if (!topic.fileType?.includes("pdf")) {
        console.log("Skipped non-PDF:", topic.fileUrl);
        continue;
      }

      if (fs.existsSync(filePath)) {
        await merger.add(filePath);
        added++;
      } else {
        console.log("File not found:", filePath);
      }
    }

    if (added === 0) {
      return res.status(400).json({ message: "No valid PDF files" });
    }

    const mergedPath = path.join(__dirname, "..", "merged.pdf");

    await merger.save(mergedPath);

    res.download(mergedPath, "merged.pdf");

  } catch (err) {
    console.log("MERGE ERROR:", err);
    res.status(500).json({ message: "Merge failed" });
  }
};


exports.downloadZip = async (req, res) => {
  try {
    const { topicIds } = req.body;

    const topics = await Topic.find({ _id: { $in: topicIds } })
      .populate("topicMasterId");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=topics.zip");

    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    archive.pipe(res);

    topics.forEach((topic) => {
      const filePath = path.join(__dirname, "..", topic.fileUrl);

      if (fs.existsSync(filePath)) {
        const fileName =
          (topic.topicMasterId?.title || "file") +
          path.extname(filePath);

        archive.file(filePath, { name: fileName });
      }
    });

    await archive.finalize();

  } catch (err) {
    console.log("=== ZIP ERROR DETAILS ===");
    console.log("Error name:", err.name);
    console.log("Error message:", err.message);
    console.log("Error stack:", err.stack);
    console.log("Full error:", err);
    
    res.status(500).json({ 
      message: "ZIP failed", 
      error: err.message
    });
  }
};

exports.uploadTopic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    if (!req.facultyId) {
      return res.status(401).json({ message: "Faculty authentication required" });
    }

    if (!req.body.courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    if (!req.body.topicName) {
      return res.status(400).json({ message: "Topic name is required" });
    }

    const topic = new Topic({
      courseId: req.body.courseId,
      topicName: req.body.topicName,
      fileUrl: req.file.path,,
      fileType: req.file.mimetype,
      facultyId: req.facultyId 
    });

    await topic.save();
    res.json(topic);

  } catch (err) {
    console.log("Upload error:", err.message);
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message
    });
  }
};



exports.getTopics = async (req, res) => {
  try {
    if (!req.facultyId) {
      return res.status(401).json({ message: "Faculty authentication required" });
    }

    const topics = await Topic.find({
      courseId: req.params.courseId,
      facultyId: req.facultyId   // 🔥 FILTER by faculty
    }).sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    console.log("Get topics error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};



// 🌐 Public topics endpoint for course page (no auth required)
exports.getPublicTopics = async (req, res) => {
  try {
    const topics = await Topic.find({
      courseId: req.params.courseId
    }).sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    console.log("Get public topics error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};



exports.updateTopic = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.topicName) {
      updateData.topicName = req.body.topicName;
    }

if (req.file) {
  updateData.fileUrl = req.file.path;
  updateData.fileType = req.file.mimetype;
}

    // Ensure faculty can only update their own topics
    const updated = await Topic.findOneAndUpdate(
      {
        _id: req.params.id,
        facultyId: req.facultyId
      },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Topic not found or unauthorized" });
    }

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Update failed" });
  }
};


exports.deleteTopic = async (req, res) => {
  try {
    const deleted = await Topic.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Topic not found or unauthorized" });
    }

    res.json({ message: "Topic deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
