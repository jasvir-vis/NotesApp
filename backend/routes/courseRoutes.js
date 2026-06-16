const express = require("express");

const router = express.Router();

const { createCourse, getCourses, deleteCourse, facultyCourses } = require("../controllers/courseController");

const auth = require("../middleware/auth");
const facultyAuth = require("../middleware/facultyAuth");



router.post("/", facultyAuth, createCourse);

router.get("/", getCourses);

router.get("/fcourse", facultyAuth, facultyCourses);

router.delete("/:id", auth, deleteCourse);



module.exports = router;
