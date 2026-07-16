const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const { getCourses } = require("../controllers/courseController");

const router = express.Router();

router.use(protect);
router.get("/", getCourses);

module.exports = router;
