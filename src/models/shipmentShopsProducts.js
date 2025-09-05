/**
 * @filename <Your file name>
 * @description This file defines the Sequelize model for the 'shipment-shop-products' table.  It represents the relationship between shipments
 * and the products within them, storing the quantity of each product in a shipment.
 * The model includes validation to ensure the quantity is always a positive decimal value.
 *
 * @version v1.0.0
 * @created Aug 19, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const ShipmentShopProducts = sequelize.define('shipment-shop-products', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
});

module.exports = ShipmentShopProducts;
