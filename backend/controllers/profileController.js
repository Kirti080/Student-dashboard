const User = require("../models/User");

const createProfileResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  program: user.program || "",
  semester: user.semester || "",
  rollNo: user.rollNo || "",
  profileImage: user.profileImage || "",
});

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      profile: createProfileResponse(req.user),
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        email,
        phone,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: createProfileResponse(user),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
