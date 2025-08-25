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
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while retrieving products by category. ${error}`
    );
    res.status(status).json({
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
    res.status(200).json({
      message: "Products fetched for the shop successfully.",
      products,
    });
  } catch (error) {
    logger.error(
      `Internal error while fetching products for the shop: ${shopId}`
    );
    res.status(500).json({
      message: "Internal error while fetching products for the shop.",
      error: error.message,
    });
  }
};

exports.getProductForStatus = async (req, res) => {
  const shopId = req.user?.shop;
  const { status } = req.params;
  try {
    const products = await productServices.getProductsForStatus(shopId, status);
    res.status(200).json({ message: "Fetched data successfully.", products });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching products for status: ${error}`);
    res.status(status).json({
      message: "Internal error while fetching products.",
      error: error.message,
    });
  }
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productServices.getSingleProduct(productId);
    res
      .status(200)
      .json({ message: "Product details fetched successfully.", product });
  } catch (error) {
    logger.error(`Internal error while fetching product details: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: "Internal error while fetching product details.",
      error: error.message,
    });
  }
};

exports.addProduct = async (req, res) => {
  const { name, price, imageUrl, categoryId } = req.body;
  try {
    const product = await productServices.addProduct(
      name,
      price,
      imageUrl,
      categoryId
    );
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    logger.error(`Internal error while adding the product: ${error}`);
    const status = error.statusCode || 500;
    res
      .status(status)
      .json({
        message: "Internal error while adding product.",
        error: error.message,
      });
  }
};

exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, price, imageUrl, categoryId } = req.body;
  try {
    const product = await productServices.updateProduct(
      productId,
      name,
      price,
      imageUrl,
      categoryId
    );
    res.status(200).json({ message: "Product updated successfully.", product });
  } catch (error) {
    logger.error(`Internal error while updating the product: ${error}`);
    const status = error.statusCode;
    res.status(status).json({
      message: "Internal error while updating the product",
      error: error.message,
    });
  }
};
