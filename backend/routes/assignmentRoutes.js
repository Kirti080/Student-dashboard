const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const { getAssignments } = require("../controllers/assignmentController");

const router = express.Router();

router.use(protect);
router.get("/", getAssignments);

module.exports = router;
