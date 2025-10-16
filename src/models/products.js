/**
 * @file products.js
 * @description Defines the Product model for the application.
 * This model represents products available in the system and stores details.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const esClient = require('../config/elasticsearch.config');
const Category = require('./category');

const Products = sequelize.define('products', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name_en: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  name_kn: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  image: {
    type: Sequelize.STRING(255),
    allowNull: false,
    validate: {
      isUrl: true,
    },
    defaultValue: process.env.DEFAULT_PRODUCT_IMAGE,
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

const getCategoryName = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  return {
    name_en: category ? category.name_en : null,
    name_kn: category ? category.name_kn : null,
  };
};

const syncProductsToES = async (product) => {
  const { name_en, name_kn } = await getCategoryName(product.categoryId);

  await esClient.index({
    index: 'products',
    id: product.id,
    document: {
      ...product.toJSON(),
      category: { name_en, name_kn }, // include category name for search
    },
  });
};

Products.afterCreate(async (product) => {
  await syncProductsToES(product);
});

Products.afterUpdate(async (product) => {
  await syncProductsToES(product);
});

Products.afterDestroy(async (product) => {
  await esClient.delete({ index: 'products', id: product.id });
});

module.exports = Products;
