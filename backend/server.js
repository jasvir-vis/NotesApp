require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const topicMasterRoutes = require("./routes/topicMasterRoutes");

const app = express();

PORT = process.env.PORT || 5000;
connectDB();

app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://notes-app-lime-five.vercel.app"
    ],
    credentials: true,
  }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Debug: Log all registered routes
app.use((req, res, next) => {
  next();
});

// routes

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/topics", require("./routes/topicRoutes"));
app.use("/api/topic-master", topicMasterRoutes);
app.use("/api/faculty",require("./routes/facultyRoutes"));

// Error handling middleware should be last
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
