const { Products } = require("../models");

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
