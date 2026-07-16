const Assignment = require("../models/Assignment");

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ program: req.user.program })
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return res.json({ assignments });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAssignments };
