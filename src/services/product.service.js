const { Products, ShopProducts, Category } = require("../models");
const { NotFoundError } = require("../utils/error");

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
