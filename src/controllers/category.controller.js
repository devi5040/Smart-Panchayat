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
    res.status(500).json({
      message: "Internal error while getting all categories.",
      error: error.message,
    });
  }
};

exports.getSignedUrl = async (req, res) => {
  const { fileName, fileType } = req.body;
  try {
    const { signedURL, fileUrl } = await categoryServices.getSignedUrl(
      fileName,
      fileType
    );
    res.status(200).json({
      message: "Signed URL received successfully.",
      signedURL,
      fileUrl,
    });
  } catch (error) {
    logger.error(
      `Internal error while receiving signed url from amazon s3: ${error}`
    );
    res.status(500).json({
      message: "Internal error while receiving signed URL from amazon s3.",
      error: error.message,
    });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    await categoryServices.addCategory(name, imageUrl);
    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    logger.error(`Internal error while creating a category: ${error}`);
    res
      .status(500)
      .json({
        message: "Internal error while adding a category",
        error: error.message,
      });
  }
};
