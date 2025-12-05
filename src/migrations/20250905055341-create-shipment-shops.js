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
    await queryInterface.createTable('shipment-shops', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      shopId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'delivered'),
        allowNull: false,
        defaultValue: 'pending',
      },
      remarks: {
        type: Sequelize.TEXT,
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

    // Add named foreign key constraints
    await queryInterface.addConstraint('shipment-shops', {
      fields: ['shipmentId'],
      type: 'foreign key',
      name: 'fk_shipment_shops_shipment',
      references: { table: 'shipments', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('shipment-shops', {
      fields: ['shopId'],
      type: 'foreign key',
      name: 'fk_shipment_shops_shop',
      references: { table: 'shops', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('shipment-shops', ['shipmentId']);
    await queryInterface.addIndex('shipment-shops', ['shopId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove foreign key constraints first
    await queryInterface.removeConstraint('shipment-shops', 'fk_shipment_shops_shipment');
    await queryInterface.removeConstraint('shipment-shops', 'fk_shipment_shops_shop');

    // Remove indexes
    await queryInterface.removeIndex('shipment-shops', ['shipmentId']);
    await queryInterface.removeIndex('shipment-shops', ['shopId']);

    // Drop table
    await queryInterface.dropTable('shipment_shops');

    // Drop ENUM to prevent duplication on re-migration
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_shipment_shops_status"`);
  },
};
