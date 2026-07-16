const mongoose = require("mongoose");
const { academicPrograms } = require("../constants/academicPrograms");

const courseSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: academicPrograms,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  },
);

courseSchema.index(
  { program: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { program: { $type: "string" } },
  },
);

module.exports = mongoose.model("Course", courseSchema);
