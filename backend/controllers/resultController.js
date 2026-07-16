const Result = require("../models/Result");

const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id, published: true })
      .populate("course", "name faculty credits")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Results fetched successfully",
      data: results,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMyResults };
