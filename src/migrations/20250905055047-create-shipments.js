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
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      transportation_mode: {
        type: Sequelize.ENUM('truck', 'bus', 'train', 'others'),
        allowNull: false,
        defaultValue: 'truck',
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      collectionCentreId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'collection-centres', key: 'id' },
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

    // Add named foreign key constraint
    await queryInterface.addConstraint('shipments', {
      fields: ['collectionCentreId'],
      type: 'foreign key',
      name: 'fk_shipments_collectionCentre',
      references: { table: 'collection-centres', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add index for faster queries
    await queryInterface.addIndex('shipments', ['collectionCentreId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove foreign key constraint first
    await queryInterface.removeConstraint('shipments', 'fk_shipments_collectionCentre');

    // Remove index
    await queryInterface.removeIndex('shipments', ['collectionCentreId']);

    // Drop table
    await queryInterface.dropTable('shipments');

    // Drop ENUM to prevent duplication errors
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_shipments_transportation_mode"`,
    );
  },
};
