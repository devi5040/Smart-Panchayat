/**
 * @file shopProducts.js
 * @description This file is a connection between shop and products model. Since same products are available in multiple different shops, the
 * association between product and shop model is many-to-many.
 *
 * @version v1.0.0
 * @created 18-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const ShopProducts = sequelize.define(
  "shop-products",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: Sequelize.ENUM("accepted", "rejected", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    quality: {
      type: Sequelize.ENUM("premium", "medium", "low"),
      allowNull: false,
      defaultValue: "medium",
    },
  },
  { indexes: [] }
);

module.exports = ShopProducts;
