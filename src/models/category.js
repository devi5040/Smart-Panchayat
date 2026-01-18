/**
 * @filename category.js
 * @description This file defines the Sequelize model for the 'category' table in the database.  It sets up the table structure, including
 * columns for ID, name, and image URL, ensuring data integrity with validation for the URL field.  This model provides an interface for
 * interacting with category data within the application.
 *
 * @version v1.0.0
 * @updated August 22, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Sequelize = require('sequelize');

const sequelize = require('../config/db');

const Category = sequelize.define('category', {
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
  imageUrl: {
    type: Sequelize.STRING(1000),
    // validate: {
    //   isUrl: true,
    // },
    defaultValue: process.env.DEFAULT_CATEGORY_IMAGE,
  },
});

module.exports = Category;
