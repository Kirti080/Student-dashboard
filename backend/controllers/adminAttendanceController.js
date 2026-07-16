const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const Course = require("../models/Course");
const User = require("../models/User");
const { isObjectId, logActivity, pagination } = require("../utils/adminUtils");

const normalizeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const validateRegister = async ({ courseId, dateValue, records }) => {
  if (!isObjectId(courseId)) {
    throw Object.assign(new Error("Select a valid course"), { status: 400 });
  }
  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw Object.assign(new Error("Course not found"), { status: 404 });
  }
  const date = normalizeDate(dateValue);
  if (!date) {
    throw Object.assign(new Error("Select a valid attendance date"), {
      status: 400,
    });
  }
  const today = normalizeDate(new Date());
  if (date > today) {
    throw Object.assign(new Error("Attendance cannot be marked in the future"), {
      status: 400,
    });
  }
  if (!Array.isArray(records) || records.length === 0) {
    throw Object.assign(new Error("The attendance register is empty"), {
      status: 400,
    });
  }
  const ids = records.map((record) => String(record.student));
  if (new Set(ids).size !== ids.length || ids.some((id) => !isObjectId(id))) {
    throw Object.assign(new Error("Duplicate or invalid students found"), {
      status: 400,
    });
  }
  if (records.some((record) => !["Present", "Absent"].includes(record.status))) {
    throw Object.assign(new Error("Status must be Present or Absent"), {
      status: 400,
    });
  }
  const validStudents = await User.find({
    _id: { $in: ids },
    role: "student",
    program: course.program,
  })
    .select("_id")
    .lean();
  if (validStudents.length !== ids.length) {
    throw Object.assign(
      new Error("Every student must belong to the selected course program"),
      { status: 400 },
    );
  }
  return { course, date };
};

const getRegisterStudents = async (req, res, next) => {
  try {
    if (!isObjectId(req.query.course)) {
      return res.status(400).json({ success: false, message: "Select a course" });
    }
    const course = await Course.findById(req.query.course).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const students = await User.find({
      role: "student",
      isActive: true,
      program: course.program,
    })
      .select("name rollNo email program semester")
      .sort({ rollNo: 1, name: 1 })
      .lean();
    return res.json({ success: true, data: { course, students } });
  } catch (error) {
    return next(error);
  }
};

const createSession = async (req, res, next) => {
  let session;
  try {
    const { course, date } = await validateRegister({
      courseId: req.body.course,
      dateValue: req.body.date,
      records: req.body.records,
    });
    const existing = await AttendanceSession.findOne({
      course: course._id,
      date,
    }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this course and date",
        existingSessionId: existing._id,
      });
    }
    const presentCount = req.body.records.filter(
      (record) => record.status === "Present",
    ).length;
    session = await AttendanceSession.create({
      course: course._id,
      program: course.program,
      date,
      markedBy: req.user._id,
      totalStudents: req.body.records.length,
      presentCount,
      absentCount: req.body.records.length - presentCount,
    });
    await Attendance.insertMany(
      req.body.records.map((record) => ({
        session: session._id,
        student: record.student,
        course: course._id,
        date,
        status: record.status,
        remarks: String(record.remarks || "").trim(),
        markedBy: req.user._id,
      })),
      { ordered: true },
    );
    await logActivity(req, "mark", "attendance-session", session._id, {
      course: course.name,
      count: req.body.records.length,
    });
    return res.status(201).json({
      success: true,
      message: "Class attendance saved successfully",
      data: session,
    });
  } catch (error) {
    if (session?._id) {
      await Promise.all([
        Attendance.deleteMany({ session: session._id }),
        AttendanceSession.deleteOne({ _id: session._id }),
      ]).catch(() => null);
    }
    return next(error);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (isObjectId(req.query.course)) filter.course = req.query.course;
    if (req.query.date) {
      const date = normalizeDate(req.query.date);
      if (date) filter.date = date;
    }
    const [data, total] = await Promise.all([
      AttendanceSession.find(filter)
        .populate("course", "name faculty program")
        .populate("markedBy", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AttendanceSession.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid session" });
    }
    const session = await AttendanceSession.findById(req.params.id)
      .populate("course", "name faculty program")
      .populate("markedBy", "name")
      .lean();
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    let records = await Attendance.find({ session: session._id })
      .populate("student", "name rollNo email program semester isActive")
      .sort({ "student.rollNo": 1 })
      .lean();
    // Attendance rows created before the session field was added were saved
    // without that relation. Recover them using the session's unique
    // course/date pair and persist the link so subsequent reads are direct.
    if (records.length === 0) {
      records = await Attendance.find({
        course: session.course._id,
        date: session.date,
      })
        .populate("student", "name rollNo email program semester isActive")
        .sort({ "student.rollNo": 1 })
        .lean();
      if (records.length > 0) {
        await Attendance.updateMany(
          { _id: { $in: records.map((record) => record._id) } },
          { $set: { session: session._id } },
        );
      }
    }
    return res.json({ success: true, data: { ...session, records } });
  } catch (error) {
    return next(error);
  }
};

const updateSession = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid session" });
    }
    const existing = await AttendanceSession.findById(req.params.id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    const { course, date } = await validateRegister({
      courseId: req.body.course,
      dateValue: req.body.date,
      records: req.body.records,
    });
    const duplicate = await AttendanceSession.findOne({
      _id: { $ne: existing._id },
      course: course._id,
      date,
    }).lean();
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this course and date",
        existingSessionId: duplicate._id,
      });
    }
    // Rebuild the rows because changing course can also change the class roster.
    // Include the legacy course/date selector for rows saved before `session`
    // became part of the Attendance schema.
    await Attendance.deleteMany({
      $or: [
        { session: existing._id },
        { course: existing.course, date: existing.date },
      ],
    });
    await Attendance.insertMany(
      req.body.records.map((record) => ({
        session: existing._id,
        student: record.student,
        course: course._id,
        date,
        status: record.status,
        remarks: String(record.remarks || "").trim(),
        markedBy: req.user._id,
      })),
      { ordered: true },
    );
    const presentCount = req.body.records.filter(
      (record) => record.status === "Present",
    ).length;
    const updated = await AttendanceSession.findByIdAndUpdate(
      existing._id,
      {
        course: course._id,
        program: course.program,
        date,
        markedBy: req.user._id,
        totalStudents: req.body.records.length,
        presentCount,
        absentCount: req.body.records.length - presentCount,
      },
      { new: true },
    );
    await logActivity(req, "update", "attendance-session", existing._id, {
      course: course.name,
      date,
    });
    return res.json({
      success: true,
      message: "Attendance session updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

const dashboardSummary = async (_req, res, next) => {
  try {
    const today = normalizeDate(new Date());
    const [totalStudents, sessions] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      AttendanceSession.find({ date: today }).lean(),
    ]);
    const presentToday = sessions.reduce(
      (sum, session) => sum + session.presentCount,
      0,
    );
    const absentToday = sessions.reduce(
      (sum, session) => sum + session.absentCount,
      0,
    );
    const marked = presentToday + absentToday;
    return res.json({
      success: true,
      data: {
        totalStudents,
        presentToday,
        absentToday,
        percentage: marked ? Math.round((presentToday / marked) * 100) : 0,
        sessionsToday: sessions.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRegisterStudents,
  createSession,
  listSessions,
  getSession,
  updateSession,
  dashboardSummary,
};
