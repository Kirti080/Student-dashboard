const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { academicPrograms } = require("../constants/academicPrograms");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      default: "",
    },

    program: {
      type: String,
      default: "",
      enum: ["", ...academicPrograms],
      required() {
        return this.role === "student";
      },
    },

    semester: {
      type: String,
      default: "",
    },

    rollNo: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  },
);

userSchema.index({
  name: "text",
  email: "text",
  rollNo: "text",
  program: "text",
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  if (!this.password.startsWith("$2")) {
    return password === this.password;
  }

  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
