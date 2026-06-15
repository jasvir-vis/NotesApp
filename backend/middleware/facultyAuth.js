const jwt = require("jsonwebtoken");
const Faculty = require("../models/Faculty");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get faculty details and check if approved
    const faculty = await Faculty.findById(decoded.id).select("-password");
    
    if (!faculty) {
      return res.status(401).json({ message: "Faculty not found" });
    }

    if (!faculty.isApproved) {
      return res.status(403).json({ message: "Faculty account not approved" });
    }

    req.facultyId = decoded.id;
    req.faculty = faculty;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
