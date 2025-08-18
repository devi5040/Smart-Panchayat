/**
 * @file products.js
 * @description Defines the Product model for the application.
 * This model represents products available in the system and stores details.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Products = sequelize.define("products", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
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
  },
  category: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
});

module.exports = Products;
