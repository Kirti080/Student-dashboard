const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/studentDashboardController");
router.get("/", protect, getDashboard);
module.exports = router;
