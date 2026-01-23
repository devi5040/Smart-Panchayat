const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Notifications = sequelize.define('notifications', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('admin', 'agent', 'user', 'all'),
    defaultValue: 'all',
    allowNull: false,
  },
});

module.exports = Notifications;
