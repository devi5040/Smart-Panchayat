/**
 * @filename shipments.js
 * @description This file defines the Sequelize model for shipments.  It handles database interactions related to shipment records, including
 * attributes like shipment date, collection center, and transportation mode.  The model uses an auto-incrementing integer as the primary key
 * and enforces data integrity through constraints.
 *
 * @version v1.0.0
 * @created August 19, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Shipments = sequelize.define('shipments', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  transportation_mode: {
    type: Sequelize.ENUM('truck', 'bus', 'train', 'others'),
    allowNull: false,
    defaultValue: 'truck',
  },
  location: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
});

module.exports = Shipments;
