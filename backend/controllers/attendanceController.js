const Attendance = require("../models/Attendance");

const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.user._id })
      .populate("course", "name faculty credits")
      .sort({ date: -1 })
      .lean();

    const counted = records.filter((record) => record.status !== "Excused");
    const attended = counted.filter((record) => ["Present", "Late"].includes(record.status)).length;
    const percentage = counted.length ? Number(((attended / counted.length) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      message: "Attendance fetched successfully",
      data: records,
      summary: { total: records.length, attended, percentage },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMyAttendance };
