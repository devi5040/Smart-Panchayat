/**
 * @filename product.controller.js
 * @description This controller handles all product-related requests, acting as an intermediary between the client and the product service.  It
 * manages requests for retrieving product lists (all products, products by category, products for a specific shop, products with a given status),
 * retrieving individual product details, adding new products, updating existing product information (including status), and deleting products.
 * Error handling is implemented throughout to provide informative responses to client requests.
 *
 * @version v1.0.0
 * @updated August 26, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const productServices = require("../services/product.service");
const logger = require("../utils/logger");

/**
 * @async
 * @function getAllProductsByCategory
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.categoryId - The ID of the category to fetch products for.
 * @description Retrieves all products belonging to a specific category.
 * @throws {Error} If there's an error retrieving products from the database.  Returns an appropriate HTTP status code based on the error.
 */
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
      `Internal error while retrieving products by category ${categoryId}. ${error}`
    );
    res.status(status).json({
      message: "Internal error while retrieving products.",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getAllProducts
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @description Retrieves all products.
 * @throws {Error} If there's an error retrieving products from the database. Returns a 500 status code.
 */
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

/**
 * @async
 * @function getProductForShops
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {number} req.user.shop - The ID of the shop to fetch products for.  Obtained from the authenticated user.
 * @description Retrieves all products associated with a specific shop.  Requires authentication.
 * @throws {Error} If the shop ID is invalid or there's an error retrieving products. Returns a 500 status code.
 */
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
      `Internal error while fetching products for the shop: ${shopId}. ${error}`
    );
    res.status(500).json({
      message: "Internal error while fetching products for the shop.",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getProductForStatus
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {number} req.user.shop - The ID of the shop. Obtained from the authenticated user.
 * @param {string} req.params.status - The status of the products to fetch.
 * @description Retrieves products based on shop ID and status. Requires authentication.
 * @throws {Error} If there's an error retrieving products. Returns an appropriate HTTP status code.
 */
exports.getProductForStatus = async (req, res) => {
  const shopId = req.user?.shop;
  const { status } = req.params;
  try {
    const products = await productServices.getProductsForStatus(shopId, status);
    res.status(200).json({ message: "Fetched data successfully.", products });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while fetching products for status ${status}: ${error}`
    );
    res.status(status).json({
      message: "Internal error while fetching products.",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getProductDetails
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to fetch details for.
 * @description Retrieves details for a single product.
 * @throws {Error} If there's an error retrieving product details. Returns an appropriate HTTP status code.
 */
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

/**
 * @async
 * @function addProduct
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.body.name - The name of the product.
 * @param {number} req.body.price - The price of the product.
 * @param {string} req.body.imageUrl - The URL of the product image.
 * @param {string} req.body.categoryId - The ID of the category the product belongs to.
 * @description Adds a new product to the database.
 * @throws {Error} If there's an error adding the product. Returns an appropriate HTTP status code.
 */
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
    res.status(status).json({
      message: "Internal error while adding product.",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function updateProduct
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to update.
 * @param {string} req.body.name - The updated name of the product.
 * @param {number} req.body.price - The updated price of the product.
 * @param {string} req.body.imageUrl - The updated URL of the product image.
 * @param {string} req.body.categoryId - The updated ID of the category the product belongs to.
 * @description Updates an existing product in the database.
 * @throws {Error} If there's an error updating the product. Returns an appropriate HTTP status code.
 */
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
    const status = error.statusCode || 500; //Default to 500 if no status code provided by error.
    res.status(status).json({
      message: "Internal error while updating the product",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function updateProductStatus
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.shopProductId - The ID of the product to update the status for.
 * @param {string} req.body.status - The new status of the product.
 * @description Updates the status of a product.
 * @throws {Error} If there's an error updating the product status. Returns an appropriate HTTP status code.
 */
exports.updateProductStatus = async (req, res) => {
  const { shopProductId } = req.params;
  const { status } = req.body;
  try {
    const product = await productServices.updateProductStatus(
      shopProductId,
      status
    );
    res
      .status(200)
      .json({ message: "Product status updated successfully", product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating product status: ${error}`);
    res.status(status).json({
      message: "Internal error while updating product status",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function deleteProduct
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to delete.
 * @description Deletes a product from the database.
 * @throws {Error} If there's an error deleting the product. Returns an appropriate HTTP status code.
 */
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    await productServices.deleteProduct(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error(`Internal error while deleting product: ${error}`);
    const status = error.statusCode || 500; //Default to 500 if no status code provided by error.
    res.status(status).json({
      message: "Internal error while deleting the product",
      error: error.message,
    });
  }
};

exports.addShopProduct = async (req, res) => {
  const {
    quality,
    quantity,
    name,
    price,
    image,
    categoryId,
    shopId,
    productId,
    date,
  } = req.body;
  try {
    const product = await productServices.addProductShop(
      quantity,
      price,
      quality,
      shopId,
      productId,
      name,
      image,
      categoryId,
      date
    );
    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while creating product for shop: ${error}`);
    res.status(status).json({
      message: "Internal error while creating product",
      error: error.message,
    });
  }
};

exports.updateProductPrice = async (req, res) => {
  const { productId } = req.params;
  const { price } = req.body;
  try {
    const product = await productServices.updateProductPrice(productId, price);
    res
      .status(200)
      .json({ message: "Product price updated successfully!", product });
  } catch (error) {
    const status = req.statusCode || 500;
    logger.error(`Internal error while updating the product price: ${error}`);
    res.status(status).json({
      message:
        "Internal error while updating the product price. Please try again later!",
      error: error.message,
    });
  }
};
