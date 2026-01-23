const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const DeviceToken = sequelize.define('device-tokens', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  platform: {
    type: Sequelize.ENUM('android', 'ios', 'web'),
    allowNull: false,
    defaultValue: 'android',
  },
});

module.exports = DeviceToken;
