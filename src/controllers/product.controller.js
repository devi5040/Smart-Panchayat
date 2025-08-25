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

exports.getProductForShops = async (req, res) => {
  const shopId = req.user?.shop;
  if (!shopId)
    return res.status(500).json({ message: "The shop ID is not valid." });
  try {
    const products = await productServices.getProductsForShop(shopId);
    res
      .status(200)
      .json({
        message: "Products fetched for the shop successfully.",
        products,
      });
  } catch (error) {
    logger.error(
      `Internal error while fetching products for the shop: ${shopId}`
    );
    res
      .status(500)
      .json({
        message: "Internal error while fetching products for the shop.",
        error: error.message,
      });
  }
};
