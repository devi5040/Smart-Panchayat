/**
 * @filename product.service.js
 * @description This file provides a comprehensive set of services for managing product data, including retrieving products by category, shop,
 * or status, adding new products, updating existing product information and status, and deleting products.  It handles various scenarios,
 * such as invalid inputs and non-existent records, throwing appropriate custom errors for better error handling.
 *
 * @version v1.0.0
 * @updated August 26, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const { Products, ShopProducts, Category, Shops } = require("../models");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require("../utils/error");

/**
 * Retrieves all products associated with a given category ID.
 * @param {number} categoryId - The ID of the category.  Must be a valid number.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of product objects. Rejects with an error if the category ID is invalid or the category is not found.
 * @throws {Error} If categoryId is invalid (0, NaN, undefined, or null).
 * @throws {NotFoundError} If the category is not found.
 */
exports.getProductsByCategory = async (categoryId) => {
  if (
    categoryId == 0 ||
    isNaN(categoryId) ||
    categoryId == undefined ||
    categoryId == null
  )
    throw new Error("Category id is invalid.");
  try {
    const products = await Products.findAll({ where: { categoryId } });
    const category = await Category.findByPk(categoryId);
    if (!category || category?.length == 0)
      throw new NotFoundError("Category not found.");
    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves all products.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of all product objects.
 */
exports.getAllProducts = async () => {
  try {
    const products = await Products.findAll();
    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves all products for a given shop ID.
 * @param {number} shopId - The ID of the shop.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of ShopProduct objects.
 */
exports.getProductsForShop = async (shopId) => {
  try {
    const shopProducts = await ShopProducts.findAll({ where: { shopId } });
    return shopProducts;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves products for a given shop ID and status.
 * @param {number} shopId - The ID of the shop.
 * @param {string} status - The status of the product.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of ShopProduct objects matching the criteria.
 */
exports.getProductsForStatus = async (shopId, status) => {
  try {
    const productsData = await ShopProducts.findAll({
      where: { shopId, status },
    });
    return productsData;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single product by its ID.
 * @param {number} productId - The ID of the product.
 * @returns {Promise<object>} - A promise that resolves to a single product object. Rejects with a NotFoundError if the product is not found.
 * @throws {NotFoundError} If the product is not found.
 */
exports.getSingleProduct = async (productId) => {
  try {
    const product = await Products.findByPk(productId);
    if (!product) throw new NotFoundError("Product does not available.");
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Adds a new product.
 * @param {string} name - The name of the product.
 * @param {number} price - The price of the product.
 * @param {string} imageUrl - The URL of the product image.
 * @param {number} categoryId - The ID of the product category.
 * @returns {Promise<object>} - A promise that resolves to the newly created product object. Rejects with a ConflictError if a product with the same name already exists.
 * @throws {ConflictError} If a product with the same name already exists.
 */
exports.addProduct = async (name, price, imageUrl, categoryId) => {
  try {
    const product = await Products.findOne({ where: { name } });
    if (product) throw new ConflictError("Product already exists.");
    const productData = await Products.create({
      name,
      price,
      image: imageUrl,
      categoryId,
    });
    return productData;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing product.
 * @param {number} productId - The ID of the product to update.
 * @param {string} name - The new name of the product.
 * @param {number} price - The new price of the product.
 * @param {string} imageUrl - The new URL of the product image.
 * @param {number} categoryId - The new ID of the product category.
 * @returns {Promise<object>} - A promise that resolves to the updated product object. Rejects with a NotFoundError if the product is not found or a BadRequestError if the update fails.
 * @throws {NotFoundError} If the product is not found.
 * @throws {BadRequestError} If the product was not updated.
 */
exports.updateProduct = async (
  productId,
  name,
  price,
  imageUrl,
  categoryId
) => {
  try {
    const product = await Products.findByPk(productId);
    if (!product || product?.length == 0)
      throw new NotFoundError("Product not found.");
    const [numRowsUpdated] = await Products.update(
      { name, price, imageUrl, categoryId },
      { where: { id: productId } }
    );
    if (numRowsUpdated == 0)
      throw new BadRequestError("Product did not update.");
    const productData = await Products.findByPk(productId);
    return productData;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates the status of a shop product.
 * @param {number} shopProductId - The ID of the shop product.
 * @param {string} status - The new status of the product.
 * @returns {Promise<object>} - A promise that resolves to the updated shop product object. Rejects with a NotFoundError if the product is not found or a BadRequestError if the update fails.
 * @throws {NotFoundError} If the product is not found.
 * @throws {BadRequestError} If the product status was not updated.
 */
exports.updateProductStatus = async (shopProductId, status) => {
  try {
    const product = await ShopProducts.findByPk(shopProductId);
    if (!product || product?.length == 0)
      throw new NotFoundError("Product not found");
    const [numRowsUpdated] = await ShopProducts.update(
      { status },
      { where: { id: shopProductId } }
    );
    if (numRowsUpdated == 0)
      throw new BadRequestError("Product status is not updated");
    const productData = await ShopProducts.findByPk(shopProductId);
    return productData;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a product by its ID.
 * @param {number} productId - The ID of the product to delete.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the product was deleted successfully. Rejects with an error if the product ID is invalid or the product is not found or if deletion fails.
 * @throws {Error} If productId is invalid (null, undefined, or NaN).
 * @throws {NotFoundError} If the product is not found.
 * @throws {BadRequestError} If the product was not deleted.
 */
exports.deleteProduct = async (productId) => {
  if (!productId || isNaN(productId)) throw new Error("Product ID is invalid");
  try {
    const product = await Products.findByPk(productId);
    if (!product || product?.length == 0)
      throw new NotFoundError("Product not found.");
    const numRowsDeleted = await Products.destroy({ where: { id: productId } });
    if (numRowsDeleted == 0)
      throw new BadRequestError("Product is not deleted");
    return true;
  } catch (error) {
    throw error;
  }
};

exports.addProductShop = async (
  quantity,
  price,
  quality,
  shopId,
  productId,
  name,
  image = process.env.DEFAULT_PRODUCT_IMAGE,
  categoryId,
  date
) => {
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError("Shop not found!");
  const product = await Products.findByPk(productId);
  if (!product && productId) throw new NotFoundError("Product not found!");
  if (!productId) {
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
  } else {
    console.log(
      `inserting ${quality}, ${quantity}, ${price}, ${shopId}, ${productId}`
    );
    const shopProduct = await ShopProducts.create({
      quality,
      quantity,
      price,
      shopId,
      productId,
      date,
    });
    return shopProduct;
  }
};

exports.updateProductPrice = async (productId, price) => {
  const product = await Products.findByPk(productId);
  if (!product) throw new NotFoundError("Product not found!");
  const [numRowsUpdated] = await Products.update(
    { price },
    { where: { id: productId } }
  );
  if (numRowsUpdated == 0) throw new NotFoundError("No rows updated!");
  const productData = await Products.findByPk(productId);
  return productData;
};
