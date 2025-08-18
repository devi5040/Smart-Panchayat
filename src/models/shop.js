/**
 * @file shop.js
 * @description Represents a shop in the system. Stores details about the shop, its owner and location.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Shops = sequelize.define("shops", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  shop_name: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  pin_code: {
    type: Sequelize.STRING(10),
    allowNull: true,
    validate: {
      len: [4, 10],
    },
  },
  priority: {
    type: Sequelize.ENUM("1", "2", "3", "4"),
    defaultValue: "4",
    allowNull: false,
  },
  latitude: {
    type: Sequelize.DECIMAL(9, 6),
    allowNull: true,
  },
  longitude: {
    type: Sequelize.DECIMAL(9, 6),
    allowNull: true,
  },
});

module.exports = Shops;
