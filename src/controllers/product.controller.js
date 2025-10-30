/**
 * @filename product.controller.js
 * @description This controller manages all interactions with product data.  It acts as the intermediary between client requests (e.g., fetching
 * product lists, adding new products, updating product details) and the underlying product service.  The controller handles various scenarios,
 * including retrieving products by category, shop, or status, and includes comprehensive error handling to ensure robust and informative responses
 *
 * @version v1.0.0
 * @updated September 5, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const productServices = require('../services/product.service');
const logger = require('../utils/logger');

/**
 * Retrieves all products belonging to a specific category.
 * @async
 * @route {GET} /products/category/:categoryId
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.categoryId - The ID of the category to fetch products for.
 * @returns {object} An object containing a message and an array of products.  Returns a 200 status code on success.
 * @throws {Error} If there's an error retrieving products from the database. Returns an appropriate HTTP status code (e.g., 500) and error message.
 */
exports.getAllProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await productServices.getProductsByCategory(categoryId);
    res.status(200).json({ message: 'Products fetched successfully.', products });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error retrieving products by category ${categoryId}: ${error}`);
    res.status(status).json({ message: 'Failed to retrieve products.', error: error.message });
  }
};

/**
 * Retrieves all products.
 * @async
 * @route {GET} /products
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {object} An object containing a message and an array of products. Returns a 200 status code on success.
 * @throws {Error} If there's an error retrieving products from the database. Returns a 500 status code and error message.
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productServices.getAllProducts();
    res.status(200).json({ message: 'Products fetched successfully.', products });
  } catch (error) {
    logger.error(`Error fetching all products: ${error}`);
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

/**
 * Retrieves all products associated with a specific shop. Requires authentication.
 * @async
 * @route {GET} /products/shop
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {number} req.user.shop - The ID of the shop to fetch products for. Obtained from the authenticated user.
 * @returns {object} An object containing a message and an array of products. Returns a 200 status code on success.
 * @throws {Error} If the shop ID is invalid or there's an error retrieving products. Returns a 500 status code and error message.
 */
exports.getProductForShops = async (req, res) => {
  const shopId = req.user?.shop;
  const { page } = req.query;
  if (!shopId) {
    return res.status(400).json({ message: 'Shop ID is required.' }); //More appropriate status code
  }
  try {
    const products = await productServices.getProductsForShop(shopId, page);
    res.status(200).json({ message: 'Products fetched successfully.', products });
  } catch (error) {
    logger.error(`Error fetching products for shop ${shopId}: ${error}`);
    res.status(500).json({
      message: 'Failed to fetch products for shop.',
      error: error.message,
    });
  }
};

/**
 * Retrieves products based on shop ID and status. Requires authentication.
 * @async
 * @route {GET} /products/shop/:status
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {number} req.user.shop - The ID of the shop. Obtained from the authenticated user.
 * @param {string} req.params.status - The status of the products to fetch.
 * @returns {object} An object containing a message and an array of products. Returns a 200 status code on success.
 * @throws {Error} If there's an error retrieving products. Returns an appropriate HTTP status code and error message.
 */
exports.getProductForStatus = async (req, res) => {
  const shopId = req.user?.shop;
  const { status, page } = req.params;
  try {
    const products = await productServices.getProductsForStatus(shopId, status, page);
    res.status(200).json({ message: 'Products fetched successfully.', products });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error fetching products for status ${status}: ${error}`);
    res.status(status).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

/**
 * Retrieves details for a single product.
 * @async
 * @route {GET} /products/:productId
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to fetch details for.
 * @returns {object} An object containing a message and the product details. Returns a 200 status code on success.
 * @throws {Error} If there's an error retrieving product details. Returns an appropriate HTTP status code and error message.
 */
exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productServices.getSingleProduct(productId);
    res.status(200).json({ message: 'Product details fetched successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error fetching product details: ${error}`);
    res.status(status).json({
      message: 'Failed to fetch product details.',
      error: error.message,
    });
  }
};

/**
 * Adds a new product to the database.
 * @async
 * @route {POST} /products
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.body.name - The name of the product.
 * @param {number} req.body.price - The price of the product.
 * @param {string} req.body.imageUrl - The URL of the product image.
 * @param {string} req.body.categoryId - The ID of the category the product belongs to.
 * @returns {object} An object containing a message and the newly created product. Returns a 201 status code on success.
 * @throws {Error} If there's an error adding the product. Returns an appropriate HTTP status code and error message.
 */
exports.addProduct = async (req, res) => {
  const { name, price, imageUrl, categoryId } = req.body;
  try {
    const product = await productServices.addProduct(name, price, imageUrl, categoryId);
    res.status(201).json({ message: 'Product added successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error adding product: ${error}`);
    res.status(status).json({ message: 'Failed to add product.', error: error.message });
  }
};

/**
 * Updates an existing product in the database.
 * @async
 * @route {PUT} /products/:productId
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to update.
 * @param {string} req.body.name - The updated name of the product.
 * @param {number} req.body.price - The updated price of the product.
 * @param {string} req.body.imageUrl - The updated URL of the product image.
 * @param {string} req.body.categoryId - The updated ID of the category the product belongs to.
 * @returns {object} An object containing a message and the updated product. Returns a 200 status code on success.
 * @throws {Error} If there's an error updating the product. Returns an appropriate HTTP status code and error message.
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
      categoryId,
    );
    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error updating product: ${error}`);
    res.status(status).json({ message: 'Failed to update product.', error: error.message });
  }
};

/**
 * Updates the status of a product.
 * @async
 * @route {PUT} /products/:shopProductId/status
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.shopProductId - The ID of the product to update the status for.
 * @param {string} req.body.status - The new status of the product.
 * @returns {object} An object containing a message and the updated product. Returns a 200 status code on success.
 * @throws {Error} If there's an error updating the product status. Returns an appropriate HTTP status code and error message.
 */
exports.updateProductStatus = async (req, res) => {
  const { shopProductId } = req.params;
  const { status } = req.body;
  try {
    const product = await productServices.updateProductStatus(shopProductId, status);
    res.status(200).json({ message: 'Product status updated successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error updating product status: ${error}`);
    res.status(status).json({
      message: 'Failed to update product status.',
      error: error.message,
    });
  }
};

/**
 * Deletes a product from the database.
 * @async
 * @route {DELETE} /products/:productId
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to delete.
 * @returns {object} An object containing a success message. Returns a 200 status code on success.
 * @throws {Error} If there's an error deleting the product. Returns an appropriate HTTP status code and error message.
 */
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    await productServices.deleteProduct(productId);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error deleting product: ${error}`);
    res.status(status).json({ message: 'Failed to delete product.', error: error.message });
  }
};

/**
 * Adds a new product to a shop.
 * @async
 * @route {POST} /shopProducts
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {number} req.body.quantity - The quantity of the product.
 * @param {number} req.body.price - The price of the product.
 * @param {string} req.body.quality - The quality of the product.
 * @param {number} req.body.shopId - The ID of the shop.
 * @param {number} req.body.productId - The ID of the product.
 * @param {string} req.body.name - The name of the product.
 * @param {string} req.body.image - The image URL of the product.
 * @param {number} req.body.categoryId - The ID of the category.
 * @param {Date} req.body.date - The date added.
 * @returns {object} An object containing a message and the newly created shop product. Returns a 201 status code on success.
 * @throws {Error} If there's an error adding the shop product. Returns an appropriate HTTP status code and error message.
 */
exports.addShopProduct = async (req, res) => {
  const { quantity, price, quality, shopId, productId, name, image, categoryId, date } = req.body;
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
      date,
    );
    res.status(201).json({ message: 'Shop product created successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error creating shop product: ${error}`);
    res.status(status).json({
      message: 'Failed to create shop product.',
      error: error.message,
    });
  }
};

/**
 * Updates the price of a product.
 * @async
 * @route {PUT} /products/:productId/price
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.productId - The ID of the product to update the price for.
 * @param {number} req.body.price - The new price of the product.
 * @returns {object} An object containing a message and the updated product. Returns a 200 status code on success.
 * @throws {Error} If there's an error updating the product price. Returns an appropriate HTTP status code and error message.
 */
exports.updateProductPrice = async (req, res) => {
  const { productId } = req.params;
  const { price } = req.body;
  try {
    const product = await productServices.updateProductPrice(productId, price);
    res.status(200).json({ message: 'Product price updated successfully.', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error updating product price: ${error}`);
    res.status(status).json({
      message: 'Failed to update product price.',
      error: error.message,
    });
  }
};

/**
 * Updates a shop product.
 * @async
 * @route {PUT} /shopProducts/:shopProductId
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {string} req.params.shopProductId - The ID of the shop product to update.
 * @param {number} req.body.quality - The updated quality of the product.
 * @param {number} req.body.quantity - The updated quantity of the product.
 * @param {Date} req.body.date - The updated date.
 * @param {number} req.body.price - The updated price of the product.
 * @returns {object} An object containing a message and the updated shop product. Returns a 200 status code on success.
 * @throws {Error} If there's an error updating the shop product. Returns an appropriate HTTP status code and error message.
 */
exports.updateShopProduct = async (req, res) => {
  const { shopProductId } = req.params;
  const { quality, quantity, date, price } = req.body;
  try {
    const data = await productServices.updateShopProducts(
      quantity,
      quality,
      price,
      date,
      shopProductId,
    );
    res.status(200).json({ message: 'Shop product updated successfully.', data });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error updating shop product: ${error}`);
    res.status(status).json({
      message: 'Failed to update shop product.',
      error: error.message,
    });
  }
};

exports.getVerifiedProducts = async (req, res) => {
  try {
    const products = await productServices.getVerifiedProducts();
    res.status(200).json({ message: 'Products fetched successfully', products });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching verified products`);
    res
      .status(status)
      .json({ message: 'Internal error while fetching verified products', error: error.message });
  }
};

exports.verifyProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productServices.verifyProduct(productId);
    res.status(200).json({ message: 'Verified product successfully', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching verified products`);
    res
      .status(status)
      .json({ message: 'Internal error while fetching verified products', error: error.message });
  }
};

exports.getRecentProducts = async (req, res) => {
  try {
    const product = await productServices.getRecentProducts();
    res.status(200).json({ message: 'Fetched recent products successfully!', product });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching products`);
    res
      .status(status)
      .json({ message: 'Internal error while fetching products', error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const products = await productServices.searchProducts(q);
    res.status(200).json({
      message: 'Fetched product successfully',
      products: products.hits.map((product) => product._source),
    });
  } catch (error) {
    logger.error(`Internal error while fetching products: ${error}`);
    res
      .status(500)
      .json({ message: 'Internal error while fetching products', error: error.message });
  }
};
