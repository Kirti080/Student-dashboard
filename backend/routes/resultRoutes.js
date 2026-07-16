const express = require("express");
const { getMyResults } = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getMyResults);

module.exports = router;
