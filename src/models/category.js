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
  imageUrl: {
    type: Sequelize.STRING(1000),
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
});

module.exports = Category;
