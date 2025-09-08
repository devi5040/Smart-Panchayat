'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('users', {
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
      },
      user_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
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
      },
      language_preference: {
        type: Sequelize.ENUM('English', 'Kannada'),
        allowNull: false,
        defaultValue: 'English',
      },
      profile_image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: process.env.DEFAULT_PROFILE_IMAGE || null,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('users');
  },
};
