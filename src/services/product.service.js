/**
 * @filename product.service.js
 * @description This service file manages all product-related data.  It provides functions to fetch products by category, shop, or status; add new products; update product details and status; and delete products.  Robust error handling ensures that invalid inputs and missing records are gracefully managed, with appropriate custom error messages for easier debugging.
 *
 * @version v1.0.0
 * @updated September 5, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const { Products, ShopProducts, Category, Shops } = require('../models');
const { NotFoundError, BadRequestError, ConflictError, NoContentError } = require('../utils/error');

/**
 * Retrieves all products associated with a given category ID.
 *
 * @async
 * @param {number} categoryId - The ID of the category. Must be a valid positive integer.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of product objects.  Returns an empty array if no products are found.
 * @throws {Error} If categoryId is invalid (0, NaN, undefined, null, or negative).
 * @throws {NotFoundError} If the category with the given ID is not found.
 */
exports.getProductsByCategory = async (categoryId) => {
  // Input validation
  if (categoryId <= 0 || isNaN(categoryId) || categoryId == null) {
    throw new Error('Invalid categoryId. Must be a positive integer.');
  }

  // Find the category
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found.`);
  }

  if (category.name === 'All') return this.getVerifiedProducts();

  // Find products associated with the category
  const products = await Products.findAll({ where: { categoryId, isVerified: true } });
  return products || []; //Return empty array if no products found
};

/**
 * Retrieves all products.
 *
 * @async
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of all product objects. Returns an empty array if no products are found.
 * @throws {NotFoundError} If no products are found.  This should ideally never happen unless there's a database issue.
 */
exports.getAllProducts = async () => {
  const products = await Products.findAll();
  return products || []; //Return empty array if no products found.  Improved error handling would be to check for database errors.
};

/**
 * Retrieves all products for a given shop ID.
 *
 * @async
 * @param {number} shopId - The ID of the shop. Must be a valid positive integer.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of ShopProduct objects. Returns an empty array if no products are found for the shop.
 * @throws {Error} If shopId is invalid (0, NaN, undefined, null, or negative).
 * @throws {NotFoundError} If the shop with the given ID is not found.
 */
exports.getProductsForShop = async (shopId) => {
  // Input validation
  if (shopId <= 0 || isNaN(shopId) || shopId == null) {
    throw new Error('Invalid shopId. Must be a positive integer.');
  }

  // Find the shop
  const shop = await Shops.findByPk(shopId);
  if (!shop) {
    throw new NotFoundError(`Shop with ID ${shopId} not found.`);
  }

  // Find shop products
  const shopProducts = await ShopProducts.findAll({ where: { shopId } });
  return shopProducts || []; //Return empty array if no products found
};

/**
 * Retrieves products for a given shop ID and status.
 *
 * @async
 * @param {number} shopId - The ID of the shop. Must be a valid positive integer.
 * @param {string} status - The status of the product (e.g., "active", "inactive").
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of ShopProduct objects matching the criteria. Returns an empty array if no matching products are found.
 * @throws {Error} If shopId is invalid (0, NaN, undefined, null, or negative).
 * @throws {NotFoundError} If the shop with the given ID is not found.
 */
exports.getProductsForStatus = async (shopId, status) => {
  // Input validation
  if (shopId <= 0 || isNaN(shopId) || shopId == null) {
    throw new Error('Invalid shopId. Must be a positive integer.');
  }

  // Find the shop
  const shop = await Shops.findByPk(shopId);
  if (!shop) {
    throw new NotFoundError(`Shop with ID ${shopId} not found.`);
  }

  // Find shop products with the specified status
  const productsData = await ShopProducts.findAll({
    where: { shopId, status },
  });
  return productsData || []; //Return empty array if no products found
};

/**
 * Retrieves a single product by its ID.
 *
 * @async
 * @param {number} productId - The ID of the product. Must be a valid positive integer.
 * @returns {Promise<object>} - A promise that resolves to a single product object.
 * @throws {Error} If productId is invalid (0, NaN, undefined, null, or negative).
 * @throws {NotFoundError} If the product with the given ID is not found.
 */
exports.getSingleProduct = async (productId) => {
  // Input validation
  if (productId <= 0 || isNaN(productId) || productId == null) {
    throw new Error('Invalid productId. Must be a positive integer.');
  }

  const product = await Products.findByPk(productId, {
    include: { model: Category, attributes: ['id', 'name'] },
  });
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found.`);
  }
  return product;
};

/**
 * Adds a new product.
 *
 * @async
 * @param {string} name - The name of the product.  Must not be null or empty.
 * @param {number} price - The price of the product. Must be a positive number.
 * @param {string} imageUrl - The URL of the product image.
 * @param {number} categoryId - The ID of the product category. Must be a valid positive integer.
 * @returns {Promise<object>} - A promise that resolves to the newly created product object.
 * @throws {Error} If any of the required parameters are invalid.
 * @throws {NotFoundError} If the category with the given ID is not found.
 * @throws {ConflictError} If a product with the same name already exists.
 */
exports.addProduct = async (name, price, imageUrl, categoryId) => {
  // Input validation
  if (!name || name.trim() === '' || price <= 0 || !categoryId || categoryId <= 0) {
    throw new Error('Invalid input parameters.');
  }

  // Find the category
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found.`);
  }

  // Check if a product with the same name already exists
  const existingProduct = await Products.findOne({ where: { name } });
  if (existingProduct) {
    throw new ConflictError(`Product with name "${name}" already exists.`);
  }

  // Create the new product
  const productData = await Products.create({
    name,
    price,
    image: imageUrl,
    categoryId,
  });
  return productData;
};

/**
 * Updates an existing product.
 *
 * @async
 * @param {number} productId - The ID of the product to update. Must be a valid positive integer.
 * @param {string} name - The new name of the product.
 * @param {number} price - The new price of the product. Must be a positive number.
 * @param {string} imageUrl - The new URL of the product image.
 * @param {number} categoryId - The new ID of the product category. Must be a valid positive integer.
 * @returns {Promise<object>} - A promise that resolves to the updated product object.
 * @throws {Error} If any of the required parameters are invalid.
 * @throws {NotFoundError} If the product or category with the given ID is not found.
 * @throws {NoContentError} If no rows were updated (product not found).
 */
exports.updateProduct = async (productId, name, price, imageUrl, categoryId) => {
  // Input validation
  if (productId <= 0 || isNaN(productId) || productId == null || price <= 0 || categoryId <= 0) {
    throw new Error('Invalid input parameters.');
  }

  // Find the product and category
  const product = await Products.findByPk(productId);
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found.`);
  }
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found.`);
  }

  // Update the product
  const [numRowsUpdated] = await Products.update(
    { name, price, imageUrl, categoryId },
    { where: { id: productId } },
  );
  if (numRowsUpdated === 0) {
    throw new NoContentError(`Product with ID ${productId} not updated.`);
  }

  // Return the updated product
  return await Products.findByPk(productId);
};

/**
 * Updates the status of a shop product.
 *
 * @async
 * @param {number} shopProductId - The ID of the shop product. Must be a valid positive integer.
 * @param {string} status - The new status of the product (e.g., "active", "inactive").
 * @returns {Promise<object>} - A promise that resolves to the updated shop product object.
 * @throws {Error} If shopProductId is invalid (0, NaN, undefined, null, or negative).
 * @throws {NotFoundError} If the shop product with the given ID is not found.
 * @throws {BadRequestError} If the shop product status was not updated.
 */
exports.updateProductStatus = async (shopProductId, status) => {
  // Input validation
  if (shopProductId <= 0 || isNaN(shopProductId) || shopProductId == null) {
    throw new Error('Invalid shopProductId. Must be a positive integer.');
  }

  // Find the shop product
  const product = await ShopProducts.findByPk(shopProductId);
  if (!product) {
    throw new NotFoundError(`Shop product with ID ${shopProductId} not found.`);
  }

  // Update the status
  const [numRowsUpdated] = await ShopProducts.update({ status }, { where: { id: shopProductId } });
  if (numRowsUpdated === 0) {
    throw new BadRequestError(`Shop product with ID ${shopProductId} status not updated.`);
  }

  // Return the updated shop product
  return await ShopProducts.findByPk(shopProductId);
};

/**
 * Deletes a product by its ID.
 *
 * @async
 * @param {number} productId - The ID of the product to delete. Must be a valid positive integer.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the product was deleted successfully.
 * @throws {Error} If productId is invalid (null, undefined, NaN, or negative).
 * @throws {NotFoundError} If the product with the given ID is not found.
 * @throws {BadRequestError} If the product was not deleted.
 */
exports.deleteProduct = async (productId) => {
  // Input validation
  if (productId <= 0 || isNaN(productId) || productId == null) {
    throw new Error('Invalid productId. Must be a positive integer.');
  }

  // Find the product
  const product = await Products.findByPk(productId);
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found.`);
  }

  // Delete the product
  const numRowsDeleted = await Products.destroy({ where: { id: productId } });
  if (numRowsDeleted === 0) {
    throw new BadRequestError(`Product with ID ${productId} not deleted.`);
  }
  return true;
};

/**
 * Adds a new product to a shop, or updates the quantity if the product already exists.
 * @async
 * @param {number} quantity - The quantity of the product. Must be a positive integer.
 * @param {number} price - The price of the product. Must be a positive number.
 * @param {string} quality - The quality of the product.
 * @param {number} shopId - The ID of the shop. Must be a valid positive integer.
 * @param {number} productId - The ID of the product.  If provided, updates an existing product; otherwise, creates a new product.
 * @param {string} name - The name of the product (only required if creating a new product).
 * @param {string} image - The URL of the product image (only required if creating a new product).
 * @param {number} categoryId - The ID of the product category (only required if creating a new product).
 * @param {Date} date - The date of the product addition/update.
 * @returns {Promise<object>} - A promise that resolves to the newly created or updated ShopProduct object.
 * @throws {Error} If input parameters are invalid.
 * @throws {NotFoundError} If the shop or category is not found, or if the product ID is invalid.
 * @throws {ConflictError} If the product already exists in the shop (when productId is provided).
 */
exports.addProductShop = async (
  quantity,
  price,
  quality,
  shopId,
  productId,
  name,
  image,
  categoryId,
  date,
) => {
  // Input validation.  More robust validation could be added here.
  if (quantity <= 0 || price <= 0 || !shopId || shopId <= 0) {
    throw new Error('Invalid input parameters.');
  }

  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError('Shop not found!');

  if (productId) {
    // Update existing product
    const product = await Products.findByPk(productId);
    if (!product) throw new NotFoundError('Product not found!');

    const sp = await ShopProducts.findOne({ where: { productId, shopId } });
    if (sp) throw new ConflictError('Product already exists in the shop. Please update it.');

    const shopProductData = await ShopProducts.create({
      quantity,
      price,
      quality,
      shopId,
      productId,
      date,
    });
    return shopProductData;
  } else {
    // Create new product
    if (!name || !image || !categoryId || categoryId <= 0) {
      throw new Error('Missing required parameters for new product.');
    }
    const category = await Category.findByPk(categoryId);
    if (!category) throw new NotFoundError('Category not found!');

    const existProduct = await Products.findOne({ where: { name } });
    if (existProduct) throw new ConflictError('Product already exists');

    const productData = await Products.create({
      name,
      price,
      image,
      categoryId,
    });
    const shopProductData = await ShopProducts.create({
      quantity,
      price,
      quality,
      shopId,
      productId: productData.id,
      date,
    });
    return shopProductData;
  }
};

/**
 * Updates the price of a product.
 * @async
 * @param {number} productId - The ID of the product to update. Must be a valid positive integer.
 * @param {number} price - The new price of the product. Must be a positive number.
 * @returns {Promise<object>} - A promise that resolves to the updated product object.
 * @throws {Error} If input parameters are invalid.
 * @throws {NotFoundError} If the product is not found.
 * @throws {NoContentError} If no rows were updated.
 */
exports.updateProductPrice = async (productId, price) => {
  // Input validation
  if (productId <= 0 || isNaN(productId) || productId == null || price <= 0) {
    throw new Error('Invalid input parameters.');
  }

  const product = await Products.findByPk(productId);
  if (!product) throw new NotFoundError('Product not found!');

  const [numRowsUpdated] = await Products.update({ price }, { where: { id: productId } });
  if (numRowsUpdated === 0) throw new NoContentError('No rows updated!');

  return await Products.findByPk(productId);
};

/**
 * Updates shop product details.
 * @async
 * @param {number} quantity - The quantity of the product. Must be a positive integer.
 * @param {string} quality - The quality of the product.
 * @param {number} price - The price of the product. Must be a positive number.
 * @param {Date} date - The date of the update.
 * @param {number} shopProductId - The ID of the shop product to update. Must be a valid positive integer.
 * @returns {Promise<object>} - A promise that resolves to the updated ShopProduct object.
 * @throws {Error} If input parameters are invalid.
 * @throws {NotFoundError} If the shop product is not found.
 * @throws {NoContentError} If no rows were updated.
 */
exports.updateShopProducts = async (quantity, quality, price, date, shopProductId) => {
  // Input validation
  if (quantity <= 0 || price <= 0 || !shopProductId || shopProductId <= 0) {
    throw new Error('Invalid input parameters.');
  }

  const shopProducts = await ShopProducts.findByPk(shopProductId);
  if (!shopProducts) throw new NotFoundError('Shop products not found!');

  const [numRowsUpdated] = await ShopProducts.update(
    {
      quantity,
      quality,
      price,
      date,
      status: 'pending', //Setting status to pending after update. Consider making this configurable.
    },
    { where: { id: shopProductId } },
  );
  if (numRowsUpdated === 0) throw new NoContentError('No rows updated!');

  const products = await ShopProducts.findByPk(shopProductId);
  return products;
};

exports.getVerifiedProducts = async () => {
  const products = await Products.findAll({ where: { isVerified: true } });
  if (!products) throw new NotFoundError('Products fetch failed');
  return products;
};

exports.verifyProduct = async (productId) => {
  const product = await Products.findByPk(productId);
  if (!product) throw new NotFoundError('Product not found');
  const [numRowsUpdated] = await Products.update(
    { isVerified: true },
    { where: { id: productId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('Product status not updated');
  const productdata = await Products.findByPk(productId);
  return productdata;
};

exports.getRecentProducts = async () => {
  const products = await Products.findAll({ order: [['updatedAt', 'DESC']], limit: 5 });
  if (!products) throw NotFoundError("Couldn't get the products!");
  return products;
};
