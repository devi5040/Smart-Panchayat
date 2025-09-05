/**
 * @file orderItems.js
 * @description This file contains the association between the products and shops model. This will contain the details about individual
 * items present in an order.
 *
 * @version v1.0.0
 * @created 18-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const OrderItems = sequelize.define('order-items', {
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
      min: 0,
    },
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  product_quality: {
    type: Sequelize.ENUM('premium', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium',
  },
});

module.exports = OrderItems;
