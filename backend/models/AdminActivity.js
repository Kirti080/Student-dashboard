const mongoose = require("mongoose");

const adminActivitySchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    resource: { type: String, required: true, trim: true, maxlength: 120 },
    resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, bufferCommands: false }
);

adminActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminActivity", adminActivitySchema);
