const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const CollectionCentre = sequelize.define('collection-centre', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name_en: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  name_kn: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  address_en: {
    type: Sequelize.STRING(1000),
    allowNull: false,
  },
  address_kn: {
    type: Sequelize.STRING(1000),
    allowNull: false,
  },
  isProcessingUnit: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = CollectionCentre;
