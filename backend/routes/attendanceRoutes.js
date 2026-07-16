const express = require("express");
const { getMyAttendance } = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getMyAttendance);

module.exports = router;
