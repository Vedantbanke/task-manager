const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/tasks",
  require("./routes/taskRoutes")
);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Task Manager server running on port ${PORT}`);
});