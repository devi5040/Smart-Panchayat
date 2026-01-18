/**
 * @file user.js
 * @description Sequelize model definition for the `User` entity.
 * This model represents users in the system and defines their attributes, data types, and constraints.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');
const esClient = require('../config/elasticsearch.config');

const Users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  firebaseUid: {
    type: Sequelize.STRING(255),
    unique: true,
    allowNull: false,
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
  user_name_en: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  user_name_kn: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  home_address_en: {
    type: Sequelize.STRING(1000),
    allowNull: true,
  },
  home_address_kn: {
    type: Sequelize.STRING(1000),
    allowNull: true,
  },
  family_name_en: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  family_name_kn: {
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
    type: Sequelize.ENUM('English', 'Kannada'),
    allowNull: false,
    defaultValue: 'English',
  },
  profile_image: {
    type: Sequelize.STRING(255),
    allowNull: true,
    // validate: {
    //   isUrl: true,
    // },
    defaultValue: process.env.DEFAULT_PROFILE_IMAGE,
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  account_status: {
    type: Sequelize.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  user_role: {
    type: Sequelize.ENUM('admin', 'user', 'shop', 'agent'),
    allowNull: false,
    defaultValue: 'user',
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

const syncUserToES = async (user) => {
  if (user.user_role !== 'user') return;

  await esClient.index({
    index: 'users',
    id: user.id,
    document: {
      id: user.id,
      user_name_en: user.user_name_en,
      user_name_kn: user.user_name_kn,
      family_name_en: user.family_name_en,
      family_name_kn: user.family_name_kn,
      phone_number: user.phone_number,
      home_address_en: user.home_address_en,
      home_address_kn: user.home_address_kn,
    },
  });
};

Users.afterCreate(async (user) => {
  await syncUserToES(user);
});

// After Update (role-aware)
Users.afterUpdate(async (user) => {
  if (user.user_role === 'user') {
    await syncUserToES(user);
  } else {
    await esClient.delete({ index: 'users', id: user.id }).catch((err) => {
      logger.error(err);
    });
  }
});

Users.afterDestroy(async (user) => {
  await esClient.delete({ index: 'users', id: user.id }).catch((err) => {
    logger.error(err);
  });
});

module.exports = Users;
