const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  uploadTopicsFromExcel,
  addTopicsManually,
  getTopics,
  deleteTopic
} = require("../controllers/topicMasterController");

const upload = multer({ dest: "uploads/" });

router.post("/excel", upload.single("file"), uploadTopicsFromExcel);
router.post("/manual", addTopicsManually);
router.get("/:courseId", getTopics);
router.delete("/delete", deleteTopic);

module.exports = router;