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

const Sequelize = require("sequelize").Sequelize;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  }
);

module.exports = sequelize;
