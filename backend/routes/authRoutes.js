const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

// Register
router.post("/register", upload.single("profileImage"), register);

// Login
router.post("/login", login);

module.exports = router;