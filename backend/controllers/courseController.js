const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ program: req.user.program })
      .sort({ name: 1 })
      .lean();
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

    return res.status(200).json({
      courses: studentCourses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  getCourses,
};
