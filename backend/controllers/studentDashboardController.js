const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const CourseProgress = require("../models/CourseProgress");

const getDashboard = async (req, res, next) => {
  try {
    const [courses, assignments, attendance, results] = await Promise.all([
      Course.find({ program: req.user.program }).sort({ name: 1 }).lean(),
      Assignment.find({ program: req.user.program })
        .sort({ dueDate: 1 })
        .lean(),
      Attendance.find({ student: req.user._id })
        .populate("course", "name")
        .sort({ date: -1 })
        .lean(),
      Result.find({ student: req.user._id, published: true })
        .populate("course", "name")
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    const progressRecords = await CourseProgress.find({
      student: req.user._id,
      course: { $in: courses.map(({ _id }) => _id) },
    }).lean();
    const progressByCourse = new Map(
      progressRecords.map((record) => [String(record.course), record]),
    );
    const studentCourses = courses.map((course) => {
      const record = progressByCourse.get(String(course._id));
      return {
        ...course,
        progress: record?.progress ?? 0,
        credits: record?.credits ?? 0,
      };
    });
    const counted = attendance.filter(({ status }) => status !== "Excused");
    const attended = counted.filter(({ status }) =>
      ["Present", "Late"].includes(status),
    ).length;
    const percentages = results.map(
      ({ marksObtained, maximumMarks }) => (marksObtained / maximumMarks) * 100,
    );
    return res.json({
      success: true,
      data: {
        profile: {
          name: req.user.name,
          program: req.user.program,
          semester: req.user.semester,
        },
        summary: {
          averageResult: percentages.length
            ? Math.round(
                percentages.reduce((sum, value) => sum + value, 0) /
                  percentages.length,
              )
            : 0,
          attendance: counted.length
            ? Math.round((attended / counted.length) * 100)
            : 0,
          credits: studentCourses.reduce(
            (sum, course) => sum + (course.credits || 0),
            0,
          ),
          pendingAssignments: assignments.filter(
            ({ status }) => status === "Active",
          ).length,
        },
        courses: studentCourses,
        assignments: assignments.slice(0, 5),
        attendance,
        results,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboard };
