const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const attendance = require("../controllers/adminAttendanceController");

const router = express.Router();
router.use(protect, authorizeRoles("admin"));

router.get("/summary", attendance.dashboardSummary);
router.get("/register-students", attendance.getRegisterStudents);
router.route("/").get(attendance.listSessions).post(attendance.createSession);
router
  .route("/:id")
  .get(attendance.getSession)
  .put(attendance.updateSession);

module.exports = router;
