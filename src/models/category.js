const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const Category = sequelize.define("category", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
});

module.exports = Category;
