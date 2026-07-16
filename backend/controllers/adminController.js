const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const AdminActivity = require("../models/AdminActivity");
const { academicPrograms } = require("../constants/academicPrograms");
const {
  escapeRegex,
  pagination,
  isObjectId,
  sendPage,
  logActivity,
  gradeFromPercentage,
} = require("../utils/adminUtils");

const findStudent = (id) =>
  isObjectId(id)
    ? User.findOne({ _id: id, role: "student" }).select("program").lean()
    : null;

const listStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = { role: "student" };
    if (req.query.search) {
      const value = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = ["name", "email", "rollNo", "program", "phone"].map(
        (field) => ({ [field]: value }),
      );
    }
    if (req.query.program) filter.program = req.query.program;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.status) filter.isActive = req.query.status === "active";
    const allowedSort = ["name", "createdAt", "semester", "program"];
    const sortBy = allowedSort.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const order = req.query.sortOrder === "asc" ? 1 : -1;
    const [data, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return sendPage(
      res,
      data,
      total,
      page,
      limit,
      "Students fetched successfully",
    );
  } catch (error) {
    return next(error);
  }
};

const getStudent = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid student ID" });
    const student = await User.findOne({ _id: req.params.id, role: "student" })
      .select("-password")
      .lean();
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    const [courses, assignments, progress, attendance, results] =
      await Promise.all([
        Course.find({ program: student.program }).lean(),
        Assignment.find({ program: student.program }).lean(),
        CourseProgress.find({ student: student._id })
          .populate("course", "name faculty program")
          .lean(),
        Attendance.find({ student: student._id })
          .populate("course", "name")
          .lean(),
        Result.find({ student: student._id }).populate("course", "name").lean(),
      ]);
    return res.json({
      success: true,
      data: { ...student, courses, assignments, progress, attendance, results },
    });
  } catch (error) {
    return next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone = "",
      program = "",
      semester = "",
      rollNo = "",
    } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({
        success: false,
        message: "Name, email and an 8-character password are required",
      });
    if (!academicPrograms.includes(program))
      return res
        .status(400)
        .json({ success: false, message: "Select a valid program" });
    const student = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      program,
      semester,
      rollNo,
      role: "student",
    });
    await logActivity(req, "create", "student", student._id, {
      email: student.email,
    });
    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student.toObject({
        versionKey: false,
        transform: (_, value) => {
          delete value.password;
          return value;
        },
      }),
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "email",
      "phone",
      "program",
      "semester",
      "rollNo",
      "isActive",
    ];
    const update = Object.fromEntries(
      allowed
        .filter((key) => req.body[key] !== undefined)
        .map((key) => [key, req.body[key]]),
    );
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      update,
      { new: true, runValidators: true },
    ).select("-password");
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    await logActivity(req, "update", "student", student._id);
    return res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== "boolean")
      return res
        .status(400)
        .json({ success: false, message: "isActive must be true or false" });
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { isActive: req.body.isActive },
      { new: true },
    ).select("-password");
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    await logActivity(
      req,
      req.body.isActive ? "activate" : "deactivate",
      "student",
      student._id,
    );
    return res.json({
      success: true,
      message: "Student status updated",
      data: student,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    await Promise.all([
      Attendance.deleteMany({ student: student._id }),
      Result.deleteMany({ student: student._id }),
      CourseProgress.deleteMany({ student: student._id }),
    ]);
    await logActivity(req, "delete", "student", student._id, {
      email: student.email,
    });
    return res.json({
      success: true,
      message: "Student and related records deleted",
    });
  } catch (error) {
    return next(error);
  }
};

const resourceMap = {
  courses: {
    Model: Course,
    owner: null,
    programOwned: true,
    populate: [],
    search: ["name", "faculty", "program"],
  },
  assignments: {
    Model: Assignment,
    owner: null,
    programOwned: true,
    populate: [],
    search: ["title", "subject", "program"],
  },
  progress: {
    Model: CourseProgress,
    owner: "student",
    populate: [
      ["student", "name email program semester rollNo"],
      ["course", "name faculty program"],
    ],
    search: [],
  },
  attendance: {
    Model: Attendance,
    owner: "student",
    populate: [
      ["student", "name email program semester"],
      ["course", "name faculty"],
    ],
    search: ["remarks"],
  },
  results: {
    Model: Result,
    owner: "student",
    populate: [
      ["student", "name email program semester"],
      ["course", "name faculty"],
    ],
    search: ["examType", "grade"],
  },
};

const listResource = (resource) => async (req, res, next) => {
  try {
    const config = resourceMap[resource];
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    const studentFilter = { role: "student" };
    if (config.programOwned && req.query.program)
      filter.program = req.query.program;
    if (req.query.program) studentFilter.program = req.query.program;
    if (req.query.semester) studentFilter.semester = req.query.semester;
    let relatedStudents = [];
    if (
      !config.programOwned &&
      (req.query.search || req.query.program || req.query.semester)
    ) {
      if (req.query.search) {
        const studentSearch = new RegExp(
          escapeRegex(req.query.search.trim()),
          "i",
        );
        studentFilter.$or = [
          { name: studentSearch },
          { email: studentSearch },
          { rollNo: studentSearch },
        ];
      }
      relatedStudents = await User.find(studentFilter).distinct("_id");
    }
    if (req.query.search) {
      const value = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = config.programOwned
        ? config.search.map((field) => ({ [field]: value }))
        : [
            ...config.search.map((field) => ({ [field]: value })),
            { [config.owner]: { $in: relatedStudents } },
          ];
    }
    if (
      !config.programOwned &&
      req.query.student &&
      isObjectId(req.query.student)
    ) {
      filter[config.owner] = req.query.student;
    } else if (
      !config.programOwned &&
      (req.query.program || req.query.semester) &&
      !req.query.search
    ) {
      filter[config.owner] = { $in: relatedStudents };
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.published) filter.published = req.query.published === "true";
    if (req.query.dateFrom || req.query.dateTo) {
      const dateField = resource === "assignments" ? "dueDate" : "date";
      filter[dateField] = {};
      if (req.query.dateFrom)
        filter[dateField].$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter[dateField].$lte = new Date(req.query.dateTo);
    }
    let query = config.Model.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    config.populate.forEach(([path, select]) => {
      query = query.populate(path, select);
    });
    const [data, total] = await Promise.all([
      query.lean({ virtuals: true }),
      config.Model.countDocuments(filter),
    ]);
    return sendPage(
      res,
      data,
      total,
      page,
      limit,
      `${resource} fetched successfully`,
    );
  } catch (error) {
    return next(error);
  }
};

const prepareResource = async (resource, body, adminId) => {
  const data = { ...body };
  delete data._id;
  delete data.role;
  delete data.createdAt;
  delete data.updatedAt;
  const config = resourceMap[resource];
  const owner = config.owner;
  if (config.programOwned) {
    if (!data.program || typeof data.program !== "string") {
      throw Object.assign(new Error("Select a valid program"), { status: 400 });
    }
    delete data.user;
    delete data.student;
  }
  if (["progress", "attendance", "results"].includes(resource)) {
    const student = await findStudent(data[owner]);
    if (!student) {
      throw Object.assign(new Error("Select a valid student"), { status: 400 });
    }
    if (
      !isObjectId(data.course) ||
      !(await Course.exists({ _id: data.course, program: student.program }))
    ) {
      throw Object.assign(
        new Error("Select a course assigned to the student's program"),
        { status: 400 },
      );
    }
  }
  if (resource === "progress") {
    const progress = Number(data.progress);
    const credits = Number(data.credits);
    if (progress < 0 || progress > 100 || credits < 0) {
      throw Object.assign(
        new Error("Progress must be 0-100 and credits cannot be negative"),
        { status: 400 },
      );
    }
    data.progress = progress;
    data.credits = credits;
  }
  if (resource === "attendance") data.markedBy = adminId;
  if (resource === "results") {
    const obtained = Number(data.marksObtained);
    const maximum = Number(data.maximumMarks);
    if (obtained < 0 || maximum <= 0 || obtained > maximum)
      throw Object.assign(new Error("Enter valid marks within the maximum"), {
        status: 400,
      });
    data.grade = data.grade || gradeFromPercentage((obtained / maximum) * 100);
  }
  return data;
};

const createResource = (resource) => async (req, res, next) => {
  try {
    const data = await prepareResource(resource, req.body, req.user._id);
    const record = await resourceMap[resource].Model.create(data);
    await logActivity(req, "create", resource, record._id);
    return res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

const bulkCreateResource = (resource) => async (req, res, next) => {
  try {
    if (
      !Array.isArray(req.body.records) ||
      req.body.records.length === 0 ||
      req.body.records.length > 100
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Provide between 1 and 100 records" });
    }
    const prepared = [];
    for (const record of req.body.records)
      prepared.push(await prepareResource(resource, record, req.user._id));
    const records = await resourceMap[resource].Model.insertMany(prepared, {
      ordered: true,
    });
    await logActivity(req, "bulk-create", resource, null, {
      count: records.length,
    });
    return res.status(201).json({
      success: true,
      message: `${records.length} records created`,
      data: records,
    });
  } catch (error) {
    return next(error);
  }
};

const updateResource = (resource) => async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid record ID" });
    const existing = await resourceMap[resource].Model.findById(
      req.params.id,
    ).lean();
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    const data = await prepareResource(
      resource,
      { ...existing, ...req.body },
      req.user._id,
    );
    const record = await resourceMap[resource].Model.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true },
    );
    await logActivity(req, "update", resource, record._id);
    return res.json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteResource = (resource) => async (req, res, next) => {
  try {
    const record = await resourceMap[resource].Model.findByIdAndDelete(
      req.params.id,
    );
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    if (resource === "courses")
      await Promise.all([
        Attendance.deleteMany({ course: record._id }),
        Result.deleteMany({ course: record._id }),
        CourseProgress.deleteMany({ course: record._id }),
      ]);
    await logActivity(req, "delete", resource, record._id);
    return res.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const dashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalCourses,
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      attendance,
      recentStudents,
      upcomingAssignments,
      activities,
      registrations,
      grades,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", isActive: true }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: "Active" }),
      Assignment.countDocuments({ status: "Closed" }),
      Attendance.find().select("status").lean(),
      User.find({ role: "student" })
        .select("name email program semester createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Assignment.find({ dueDate: { $gte: new Date() }, status: "Active" })
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
      AdminActivity.find()
        .populate("admin", "name")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      User.aggregate([
        { $match: { role: "student" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            value: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      Result.aggregate([
        { $match: { published: true } },
        { $group: { _id: "$grade", value: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const counted = attendance.filter(({ status }) => status !== "Excused");
    const attended = counted.filter(({ status }) =>
      ["Present", "Late"].includes(status),
    ).length;
    return res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeStudents,
          inactiveStudents: totalStudents - activeStudents,
          totalCourses,
          totalAssignments,
          pendingAssignments,
          submittedAssignments,
          averageAttendance: counted.length
            ? Math.round((attended / counted.length) * 100)
            : 0,
        },
        recentStudents,
        upcomingAssignments,
        activities,
        charts: {
          registrations: registrations.map((item) => ({
            name: `${item._id.month}/${item._id.year}`,
            value: item.value,
          })),
          assignments: [
            { name: "Active", value: pendingAssignments },
            { name: "Closed", value: submittedAssignments },
          ],
          attendance: ["Present", "Absent", "Late", "Excused"].map((name) => ({
            name,
            value: attendance.filter((item) => item.status === name).length,
          })),
          grades: grades.map((item) => ({
            name: item._id || "Ungraded",
            value: item.value,
          })),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  listResource,
  createResource,
  bulkCreateResource,
  updateResource,
  deleteResource,
  dashboard,
};
