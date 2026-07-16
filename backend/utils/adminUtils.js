const mongoose = require("mongoose");
const AdminActivity = require("../models/AdminActivity");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

const isObjectId = (value) => mongoose.isValidObjectId(value);

const sendPage = (res, data, total, page, limit, message) => res.json({
  success: true,
  message,
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});

const logActivity = (req, action, resource, resourceId, details = {}) =>
  AdminActivity.create({ admin: req.user._id, action, resource, resourceId, details }).catch(() => null);

const gradeFromPercentage = (value) => {
  if (value >= 90) return "A+";
  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  return "F";
};

module.exports = { escapeRegex, pagination, isObjectId, sendPage, logActivity, gradeFromPercentage };
