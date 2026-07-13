const Assignment = require("../models/Assignment");

const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, subject, dueDate, description, priority } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        message: "Title and subject are required",
      });
    }

    const assignment = await Assignment.create({
      user: req.user._id,
      title,
      subject,
      dueDate: dueDate || null,
      description,
      priority,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};



const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, dueDate, description, priority, status } = req.body;
    const update = {
      title,
      subject,
      dueDate: dueDate || null,
      description,
      priority,
      status,
    };

    const assignment = await Assignment.findOneAndUpdate({ _id: id, user: req.user._id }, update, {
      new: true,
      runValidators: true,
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found or you do not have access",
      });
    }

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Update Assignment Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};


const deleteAssignment = async (req , res) => {
    try {
        const { id } = req.params;

        const assignment = await Assignment.findOneAndDelete({ _id: id, user: req.user._id });

        if (!assignment) {
          return res.status(404).json({
          message: "Assignment not found or you do not have access",
          });
        }

        return res.status(200).json({
          message: "Assignment deleted successfully",
          assignment,
        });
      } catch (error) {
        console.error("Delete Assignment Error:", error);

        return res.status(500).json({
          message: error.message || "Server Error",
        });
      }
    }

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
