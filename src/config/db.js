/**
 * @file db.js
 * @description Database configuration and connection setup for the app.
 * Handles connection to the mysql database using sequelize.
 * Exports the database instance to use it in the app.
 *
 * @version v1.0.0
 * @created 13-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Sequelize = require('sequelize').Sequelize;
const configs = require('./sequelize.config');

const env = process.env.NODE_ENV || 'development';

const config = configs[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  dialect: config.dialect,
  host: config.host,
});

module.exports = sequelize;
