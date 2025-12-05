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
    await queryInterface.createTable('collection-centres', {
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
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('collection-centres');
  },
};
