const Faculty = require("../models/Faculty");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");





// ✅ REGISTER

exports.registerFaculty = async (req, res) => {

  try {

    const { name, facultyId, password } = req.body;



    const exists = await Faculty.findOne({ facultyId });



    if (exists) {

      return res.status(400).json({ message: "Faculty already exists ❌" });

    }



    const hashedPassword = await bcrypt.hash(password, 10);



    const faculty = await Faculty.create({

      name,

      facultyId,

      password: hashedPassword

    });



    res.json({

      message: "Registered successfully. Wait for approval ✅",

      faculty

    });



  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Registration failed ❌" });

  }

};





// ✅ LOGIN

exports.loginFaculty = async (req, res) => {

  try {

    const { facultyId, password } = req.body;



    const user = await Faculty.findOne({ facultyId });



    if (!user) {

      return res.status(400).json({ message: "User not found ❌" });

    }



    const match = await bcrypt.compare(password, user.password);



    if (!match) {

      return res.status(400).json({ message: "Wrong password ❌" });

    }



    // 🔥 Approval check

    if (!user.isApproved) {

      return res.status(403).json({ message: "Waiting for admin approval ⏳" });

    }



    const token = jwt.sign(

      { id: user._id },

      process.env.JWT_SECRET,

      { expiresIn: "7d" }

    );



    res.json({

      message: "Login successful ✅",

      token,

      user: {

        name: user.name,

        facultyId: user.facultyId

      }

    });



  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Login failed ❌" });

  }

};





// ✅ GET ALL FACULTY

exports.getAllFaculty = async (req, res) => {

  try {

    const data = await Faculty.find().select("-password");

    res.json(data);

  } catch (err) {

    res.status(500).json({ message: "Failed to fetch faculty ❌" });

  }

};





// ✅ GET SINGLE FACULTY

exports.getFacultyById = async (req, res) => {

  try {

    const data = await Faculty.findById(req.params.id).select("-password");



    if (!data) {

      return res.status(404).json({ message: "Not found ❌" });

    }



    res.json(data);



  } catch (err) {

    res.status(500).json({ message: "Error ❌" });

  }

};





// ✅ UPDATE FACULTY

exports.updateFaculty = async (req, res) => {

  try {

    const { name, password } = req.body;



    let updateData = { name };



    // 🔐 If password update requested

    if (password) {

      const hashed = await bcrypt.hash(password, 10);

      updateData.password = hashed;

    }



    const updated = await Faculty.findByIdAndUpdate(

      req.params.id,

      updateData,

      { new: true }

    ).select("-password");



    res.json({

      message: "Updated successfully ✅",

      updated

    });



  } catch (err) {

    res.status(500).json({ message: "Update failed ❌" });

  }

};





// ❌ DELETE FACULTY

exports.deleteFaculty = async (req, res) => {

  try {

    await Faculty.findByIdAndDelete(req.params.id);



    res.json({ message: "Deleted successfully 🗑️" });



  } catch (err) {

    res.status(500).json({ message: "Delete failed ❌" });

  }

};





// 👑 APPROVE FACULTY

exports.approveFaculty = async (req, res) => {

  try {

    const updated = await Faculty.findByIdAndUpdate(

      req.params.id,

      { isApproved: true },

      { new: true }

    ).select("-password");



    res.json({

      message: "Faculty approved ✅",

      updated

    });



  } catch (err) {

    res.status(500).json({ message: "Approval failed ❌" });

  }

};

// REJECT FACULTY
exports.rejectFaculty = async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).select("-password");

    res.json({
      message: "Faculty rejected ",
      updated
    });

  } catch (err) {
    res.status(500).json({ message: "Rejection failed ❌" });
  }
};

// GET FACULTY PROFILE
exports.getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.facultyId).select("-password");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found " });
    }
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile " });
  }
};

// UPDATE FACULTY PROFILE
exports.updateFacultyProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const facultyId = req.facultyId;

    // Find faculty
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found " });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, faculty.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect " });
    }

    // Prepare update data
    const updateData = { name };

    // Update password if new password provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update faculty
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      facultyId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully ✅",
      updatedFaculty
    });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile ❌" });
  }
};