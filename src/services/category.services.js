const { Category } = require("../models/");

exports.getCategories = async () => {
  try {
    const categories = await Category.findAll();
    return categories;
  } catch (error) {
    throw error;
  }
};
