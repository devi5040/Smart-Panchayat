const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const CollectionCentre = sequelize.define('collection-centre', {
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
  address: {
    type: Sequelize.STRING(1000),
    allowNull: false,
  },
  isProcessingUnit: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = CollectionCentre;
