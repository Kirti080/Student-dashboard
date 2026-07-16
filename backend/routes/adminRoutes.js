const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

const router = express.Router();
router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", admin.dashboard);
router.route("/students").get(admin.listStudents).post(admin.createStudent);
router
  .route("/students/:id")
  .get(admin.getStudent)
  .put(admin.updateStudent)
  .delete(admin.deleteStudent);
router.patch("/students/:id/status", admin.updateStudentStatus);

["courses", "assignments", "progress", "attendance", "results"].forEach(
  (resource) => {
    if (["attendance", "results"].includes(resource))
      router.post(`/${resource}/bulk`, admin.bulkCreateResource(resource));
    router
      .route(`/${resource}`)
      .get(admin.listResource(resource))
      .post(admin.createResource(resource));
    router
      .route(`/${resource}/:id`)
      .put(admin.updateResource(resource))
      .delete(admin.deleteResource(resource));
  },
);

module.exports = router;
