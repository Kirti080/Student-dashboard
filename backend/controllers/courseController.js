const Course = require("../models/Course");

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, faculty, progress, credits } = req.body;

    if (!name || !faculty || !credits) {
      return res.status(400).json({
        message: "Name, faculty and credits are required",
      });
    }

    const course = await Course.create({
      user: req.user._id,
      name,
      faculty,
      progress: Number(progress) || 0,
      credits: Number(credits),
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  getCourses,
  createCourse,
};
