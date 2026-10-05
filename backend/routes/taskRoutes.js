const express = require("express");

const {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getTasks);

router.post("/", authMiddleware, addTask);

router.put(
  "/:id/toggle",
  authMiddleware,
  toggleTask
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);

module.exports = router;