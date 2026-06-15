const express = require("express");
const router = express.Router();
const facultyAuth = require("../middleware/facultyAuth");
const auth = require("../middleware/auth");
const { upload, uploadFacultyFromExcel } = require("../controllers/excelUploadController");

const {
  registerFaculty,
  loginFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  approveFaculty,
  rejectFaculty,
  getFacultyProfile,
  updateFacultyProfile
} = require("../controllers/facultyController");

router.post("/register", registerFaculty);
router.post("/login", loginFaculty);

// Faculty specific routes (must come before /:id)
router.get("/profile", facultyAuth, getFacultyProfile);
router.put("/profile", facultyAuth, updateFacultyProfile);
router.get("/my-courses", facultyAuth, require("../controllers/courseController").facultyCourses);

// Excel upload route
router.post("/upload-excel", auth, upload, uploadFacultyFromExcel);

router.get("/", getAllFaculty);
router.get("/:id", getFacultyById);

router.put("/:id", auth, updateFaculty);
router.delete("/:id", auth, deleteFaculty);

// 👑 approval/rejection (admin only)
router.put("/approve/:id", auth, approveFaculty);
router.put("/reject/:id", auth, rejectFaculty);

module.exports = router;