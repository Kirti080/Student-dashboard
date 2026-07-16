const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { academicPrograms } = require("../constants/academicPrograms");

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const createUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  program: user.program || "",
  semester: user.semester || "",
  rollNo: user.rollNo || "",
  profileImage: user.profileImage || "",
  role: user.role || "student",
  isActive: user.isActive !== false,
});

const validateAuthFields = (res, fields) => {
  const missingField = fields.find(([_, value]) => !value);

  if (missingField) {
    res.status(400).json({
      message: `${missingField[0]} is required`,
    });

    return false;
  }

  return true;
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, phone, program, semester, rollNo } =
      req.body;

    if (
      !validateAuthFields(res, [
        ["Name", name],
        ["Email", email],
        ["Password", password],
        ["Program", program],
      ])
    ) {
      return;
    }

    if (!academicPrograms.includes(program)) {
      return res.status(400).json({ message: "Select a valid program" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      program,
      semester,
      rollNo,
      password,
      profileImage: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !validateAuthFields(res, [
        ["Email", email],
        ["Password", password],
      ])
    ) {
      return;
    }

    // Check email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account is inactive" });
    }

    if (!user.password.startsWith("$2")) {
      user.password = password;
      user.markModified("password");
      await user.save();
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};
