require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!process.env.MONGO_URI || !name || !email || !password) throw new Error("Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ADMIN_EMAIL is invalid");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") throw new Error("That email already belongs to a student");
    console.log(`Admin already exists: ${email}`);
    return;
  }
  await User.create({ name, email, password, role: "admin", isActive: true });
  console.log(`Admin created successfully: ${email}`);
};

run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
