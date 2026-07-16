const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true, bufferCommands: false },
);

courseProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
