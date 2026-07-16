const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    program: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },
    totalStudents: { type: Number, required: true, min: 0 },
    presentCount: { type: Number, required: true, min: 0 },
    absentCount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, bufferCommands: false },
);

attendanceSessionSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
