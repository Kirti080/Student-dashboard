const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getCourses,
  createCourse,
} = require("../controllers/courseController");

const router = express.Router();

router.use(protect);
router.get("/", getCourses);
router.post("/", createCourse);

module.exports = router;
