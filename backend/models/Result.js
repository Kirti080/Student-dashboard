const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    examType: { type: String, required: true, trim: true, maxlength: 100, index: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maximumMarks: { type: Number, required: true, min: 1 },
    grade: { type: String, default: "", trim: true, index: true },
    remarks: { type: String, default: "", trim: true, maxlength: 500 },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, bufferCommands: false, toJSON: { virtuals: true } }
);

resultSchema.virtual("percentage").get(function () {
  return this.maximumMarks > 0
    ? Number(((this.marksObtained / this.maximumMarks) * 100).toFixed(2))
    : 0;
});

resultSchema.pre("validate", function () {
  if (this.marksObtained > this.maximumMarks) {
    this.invalidate("marksObtained", "Marks obtained cannot exceed maximum marks");
  }
});

resultSchema.index({ student: 1, course: 1, examType: 1 });

module.exports = mongoose.model("Result", resultSchema);
