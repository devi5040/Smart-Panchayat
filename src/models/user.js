/**
 * @file user.js
 * @description Sequelize model definition for the `User` entity.
 * This model represents users in the system and defines their attributes, data types, and constraints.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Users = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  phone_number: {
    type: Sequelize.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      is: /^\+?[0-9\s]{10,20}$/,
      notEmpty: true,
    },
  },
  user_name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  home_address: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  family_name: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  pin_code: {
    type: Sequelize.STRING(10),
    allowNull: true,
    validate: {
      len: [4, 10],
    },
  },
  language_preference: {
    type: Sequelize.ENUM("English", "Kannada"),
    allowNull: false,
    defaultValue: "English",
  },
  profile_image: {
    type: Sequelize.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true,
    },
    defaultValue: process.env.DEFAULT_PROFILE_IMAGE,
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  account_status: {
    type: Sequelize.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
  user_role: {
    type: Sequelize.ENUM("admin", "user", "shop", "agent"),
    allowNull: false,
    defaultValue: "user",
  },
  latitude: {
    type: Sequelize.DECIMAL(9, 6),
    allowNull: true,
  },
  longitude: {
    type: Sequelize.DECIMAL(9, 6),
    allowNull: true,
  },
});

module.exports = Users;
