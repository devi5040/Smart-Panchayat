const productServices = require("../services/product.service");
const logger = require("../utils/logger");

exports.getAllProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await productServices.getProductsByCategory(categoryId);
    res
      .status(200)
      .json({ message: "Products fetched successfully.", products });
  } catch (error) {
    logger.error(
      `Internal error while retrieving products by category. ${error}`
    );
    res.status(500).json({
      message: "Internal error while retrieving products.",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productServices.getAllProducts();
    res
      .status(200)
      .json({ message: "Products fetched successfully.", products });
  } catch (error) {
    logger.error(`Internal error while fetching all products: ${error}`);
    res.status(500).json({
      message: "Internal error while fetching products.",
      error: error.message,
    });
  }
};
