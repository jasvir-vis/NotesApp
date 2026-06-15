const TopicMaster = require("../models/TopicMaster");
const xlsx = require("xlsx");


// 🔥 EXCEL UPLOAD
exports.uploadTopicsFromExcel = async (req, res) => {
  try {
    const { courseId } = req.body;

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = xlsx.utils.sheet_to_json(sheet);

    // extract topic column
    let topics = data.map(row => row.Topic);

    // clean + lowercase + remove duplicates
    topics = topics
      .filter(Boolean)
      .map(t => t.toLowerCase().trim());

    topics = [...new Set(topics)];

    let topicDoc = await TopicMaster.findOne({ courseId });

    if (!topicDoc) {
      topicDoc = await TopicMaster.create({
        courseId,
        topics
      });
    } else {
      const combined = [...topicDoc.topics, ...topics];
      topicDoc.topics = [...new Set(combined)];
      await topicDoc.save();
    }

    res.json({ message: "Excel topics uploaded", topics: topicDoc.topics });

  } catch (err) {
    res.status(500).json({ message: "Excel upload failed" });
  }
};



// MANUAL ADD (ONE OR MULTIPLE)
exports.addTopicsManually = async (req, res) => {
  try {
    const { courseId, topic } = req.body;

    let topicsArray = [];

    // allow comma separated OR single
    if (topic.includes(",")) {
      topicsArray = topic.split(",").map(t => t.trim().toLowerCase());
    } else {
      topicsArray = [topic.toLowerCase().trim()];
    }

    let topicDoc = await TopicMaster.findOne({ courseId });

    if (!topicDoc) {
      topicDoc = await TopicMaster.create({
        courseId,
        topics: [...new Set(topicsArray)]
      });
    } else {
      const combined = [...topicDoc.topics, ...topicsArray];
      topicDoc.topics = [...new Set(combined)];
      await topicDoc.save();
    }

    res.json(topicDoc);

  } catch (err) {
    res.status(500).json({ message: "Manual add failed" });
  }
};



// GET TOPICS (FOR DROPDOWN)
exports.getTopics = async (req, res) => {
  const doc = await TopicMaster.findOne({
    courseId: req.params.courseId
  });

  res.json(doc?.topics || []);
};

// DELETE TOPIC
exports.deleteTopic = async (req, res) => {
  try {
    const { courseId, topic } = req.body;

    const topicDoc = await TopicMaster.findOne({ courseId });

    if (!topicDoc) {
      return res.status(404).json({ message: "Topic master not found" });
    }

    // Remove the topic from the array (case insensitive)
    topicDoc.topics = topicDoc.topics.filter(t => t.toLowerCase() !== topic.toLowerCase());
    
    await topicDoc.save();

    res.json({ message: "Topic deleted successfully", topics: topicDoc.topics });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};