const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const ShipmentShopProducts = sequelize.define("shipment-shop-products", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
});

module.exports = ShipmentShopProducts;
