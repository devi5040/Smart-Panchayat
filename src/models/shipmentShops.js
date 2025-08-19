/*
 * @filename shipmentShops.js
 * @description This file defines the Sequelize model for 'shipment-shops'.  It represents the relationship between shipments and shops,
 * tracking the status of each shipment (pending or delivered) and allowing for optional remarks.
 * The model includes an auto-incrementing ID as the primary key.
 *
 * @version v1.0.0
 * @created August 19, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const ShipmentShops = sequelize.define("shipment-shops", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: Sequelize.ENUM("pending", "delivered"),
    allowNull: false,
    defaultValue: "pending",
  },
  remarks: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

module.exports = ShipmentShops;
