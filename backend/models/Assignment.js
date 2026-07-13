const mongoose = require("mongoose");
const assignmentSchema = new mongoose.Schema(

    {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title:{
      type:String,
      required: true,
      trim:true,
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
      enum: ["Pending", "Submitted"],
      default: "Pending",
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
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
