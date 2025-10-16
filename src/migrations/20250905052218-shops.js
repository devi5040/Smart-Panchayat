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
    await queryInterface.createTable('shops', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      shop_name_en: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      shop_name_kn: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      pin_code: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('1', '2', '3', '4'),
        defaultValue: '4',
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
    await queryInterface.dropTable('shops');
  },
};
