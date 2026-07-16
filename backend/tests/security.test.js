const test = require("node:test");
const assert = require("node:assert/strict");
const { authorizeRoles } = require("../middleware/authMiddleware");
const Result = require("../models/Result");
const CourseProgress = require("../models/CourseProgress");
const { escapeRegex, gradeFromPercentage } = require("../utils/adminUtils");

test("student is rejected by admin role middleware", () => {
  let statusCode = 0;
  const req = { user: { role: "student" } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      return body;
    },
  };
  authorizeRoles("admin")(req, res, () => assert.fail("student must not pass"));
  assert.equal(statusCode, 403);
});

test("admin passes admin role middleware", () => {
  let passed = false;
  authorizeRoles("admin")({ user: { role: "admin" } }, {}, () => {
    passed = true;
  });
  assert.equal(passed, true);
});

test("result rejects obtained marks above maximum", async () => {
  const result = new Result({
    student: "507f191e810c19729de860ea",
    course: "507f191e810c19729de860eb",
    examType: "Final",
    marksObtained: 101,
    maximumMarks: 100,
  });
  await assert.rejects(() => result.validate(), /cannot exceed maximum/i);
});

test("course progress rejects values above 100", async () => {
  const record = new CourseProgress({
    student: "507f191e810c19729de860ea",
    course: "507f191e810c19729de860eb",
    progress: 101,
    credits: 2,
  });
  await assert.rejects(() => record.validate(), /maximum allowed value/i);
});

test("search input is escaped before creating a regular expression", () => {
  assert.equal(escapeRegex("a.*(b)"), "a\\.\\*\\(b\\)");
});

test("grade helper returns stable boundaries", () => {
  assert.equal(gradeFromPercentage(90), "A+");
  assert.equal(gradeFromPercentage(50), "D");
  assert.equal(gradeFromPercentage(49.9), "F");
});
