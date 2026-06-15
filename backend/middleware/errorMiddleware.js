module.exports = (err, req, res, next) => {
  console.log("Error:", err.message);
  res.status(500).json({
    message: err.message || "Server Error"
  });
};