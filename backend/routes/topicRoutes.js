const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const Topic = require("../models/Topic");

const {
  uploadTopic,
  getTopics,
  getPublicTopics,
  updateTopic,
  deleteTopic,
  downloadZip,
  mergeAndDownload
} = require("../controllers/topicController");
const facultyAuth = require("../middleware/facultyAuth");

// Test route - must come before parameterized routes
router.get("/test", (req, res) => {
  console.log("=== TOPIC TEST ROUTE HIT ===");
  res.json({ message: "Topic routes are working!" });
});

router.post(
  "/upload",
  facultyAuth,
  upload.single("file"),
  uploadTopic
);

// Public endpoint for course page (no auth required)
router.get("/public/:courseId", getPublicTopics);

router.get("/:courseId", facultyAuth, getTopics);

router.put(
  "/:id",
  facultyAuth,
  upload.single("file"),
  updateTopic
);

router.delete("/:id", facultyAuth, deleteTopic);

router.post("/view/:id", async (req, res) => {
  try {
    await Topic.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });

    res.json({ message: "View counted" });
  } catch (err) {
    res.status(500).json({ message: "View error" });
  }
});

router.post("/download-zip", downloadZip);
router.post("/merge-pdf", mergeAndDownload);

module.exports = router;