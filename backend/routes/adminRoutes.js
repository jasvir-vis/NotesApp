const express = require("express");

const router = express.Router();

const { registerAdmin, loginAdmin, getAdminProfile, updateAdminProfile } = require("../controllers/adminController");

const auth = require("../middleware/auth");



router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get("/profile", auth, getAdminProfile);

router.put("/profile", auth, updateAdminProfile);



module.exports = router;