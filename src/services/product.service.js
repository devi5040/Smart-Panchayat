const { Products, ShopProducts } = require("../models");

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
