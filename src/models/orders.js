/**
 * @file orders.js
 * @description This file defines the schema for orders model and exports it.
 *
 * @version v1.0.0
 * @created 18-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Orders = sequelize.define('orders', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  payment_status: {
    type: Sequelize.ENUM('paid', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
  },
});

module.exports = Orders;
