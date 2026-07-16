const Attendance = require("../models/Attendance");

const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.user._id })
      .populate("course", "name faculty credits")
      .sort({ date: -1 })
      .lean();

    const attended = records.filter((record) => record.status === "Present").length;
    const missed = records.length - attended;
    const percentage = records.length
      ? Number(((attended / records.length) * 100).toFixed(2))
      : 0;
    const subjectMap = new Map();
    for (const record of records) {
      const courseId = String(record.course?._id || "unknown");
      const current = subjectMap.get(courseId) || {
        course: record.course,
        total: 0,
        attended: 0,
        missed: 0,
        percentage: 0,
      };
      current.total += 1;
      if (record.status === "Present") current.attended += 1;
      else current.missed += 1;
      subjectMap.set(courseId, current);
    }
    const subjects = [...subjectMap.values()]
      .map((subject) => ({
        ...subject,
        percentage: subject.total
          ? Number(((subject.attended / subject.total) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => (a.course?.name || "").localeCompare(b.course?.name || ""));

    return res.json({
      success: true,
      message: "Attendance fetched successfully",
      data: records,
      summary: { total: records.length, attended, missed, percentage },
      subjects,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMyAttendance };
