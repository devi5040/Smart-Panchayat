const { Products, ShopProducts, Category } = require("../models");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require("../utils/error");

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

exports.getAllProducts = async () => {
  try {
    const products = await Products.findAll();
    return products;
  } catch (error) {
    throw error;
  }
};

exports.getProductsForShop = async (shopId) => {
  try {
    const shopProducts = await ShopProducts.findAll({ where: { shopId } });
    return shopProducts;
  } catch (error) {
    throw error;
  }
};

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

exports.getSingleProduct = async (productId) => {
  try {
    const product = await Products.findByPk(productId);
    if (!product) throw new NotFoundError("Product does not available.");
    return product;
  } catch (error) {
    throw error;
  }
};

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
    if (numRowsUpdated == 0) BadRequestError("Product did not update.");
    const productData = await Products.findByPk(productId);
    return productData;
  } catch (error) {
    throw error;
  }
};

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

exports.deleteProduct = async (productId) => {
  if (!productId || isNaN(productId)) throw new Error("Product ID is invalid");
  try {
    const product = await Products.findByPk(productId);
    if (!product || product?.length == 0)
      throw new NotFoundError("Product not found.");
    const numRowsDeleted = await Products.destroy({ where: { id: productId } });
    if (numRowsDeleted == 0) BadRequestError("Product is not deleted");
    return true;
  } catch (error) {
    throw error;
  }
};
