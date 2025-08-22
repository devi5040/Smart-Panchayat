const categoryServices = require("../services/category.services");
const logger = require("../utils/logger");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryServices.getCategories();
    res
      .status(200)
      .json({ message: "Retrieved all categories successfully.", categories });
  } catch (error) {
    logger.error(`Internal error while getting all categories. ${error}`);
    res
      .status(500)
      .json({
        message: "Internal error while getting all categories.",
        error: error.message,
      });
  }
};
