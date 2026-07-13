const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

module.exports = mongoose.model("Course", courseSchema);
