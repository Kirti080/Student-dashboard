const mongoose = require("mongoose");
const { academicPrograms } = require("../constants/academicPrograms");
const assignmentSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: academicPrograms,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
