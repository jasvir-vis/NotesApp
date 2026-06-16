const Course = require("../models/Course");


// ✅ CREATE COURSE (with facultyId)
exports.createCourse = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FACULTY ID:", req.facultyId);
    const course = await Course.create({
      ...req.body,
      facultyId: req.facultyId   // 🔥 attach logged-in faculty
    });

    res.json(course);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Create failed ❌" });
  }
};


exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.json(courses);

  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
};

exports.facultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      facultyId: req.facultyId
    }).sort({ createdAt: -1 });

    res.json(courses);

  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
};


// ✅ GET SINGLE COURSE
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      facultyId: req.facultyId   // 🔥 ensure ownership
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found ❌" });
    }

    res.json(course);

  } catch (err) {
    res.status(500).json({ message: "Error ❌" });
  }
};


// ✅ UPDATE COURSE
exports.updateCourse = async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate(
      {
        _id: req.params.id,
        facultyId: req.facultyId   // 🔥 ownership check
      },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found ❌" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
};


// ❌ DELETE COURSE (only owner)
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId   // 🔥 secure delete
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found ❌" });
    }

    res.json({ message: "Course deleted ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed ❌" });
  }
};
