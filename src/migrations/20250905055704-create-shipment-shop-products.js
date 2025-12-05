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
    await queryInterface.createTable('shipment-shop-products', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      shipmentShopId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'shipment-shops', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.addConstraint('shipment-shop-products', {
      fields: ['shipmentShopId'],
      type: 'foreign key',
      name: 'fk_shipment_shop_products_shipment_shop',
      references: { table: 'shipment-shops', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('shipment-shop-products', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_shipment_shop_products_product',
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes for performance
    await queryInterface.addIndex('shipment-shop-products', ['shipmentShopId']);
    await queryInterface.addIndex('shipment-shop-products', ['productId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove foreign key constraints first
    await queryInterface.removeConstraint(
      'shipment-shop-products',
      'fk_shipment_shop_products_shipment_shop',
    );
    await queryInterface.removeConstraint(
      'shipment-shop-products',
      'fk_shipment_shop_products_product',
    );

    // Remove indexes
    await queryInterface.removeIndex('shipment-shop-products', ['shipmentShopId']);
    await queryInterface.removeIndex('shipment-shop-products', ['productId']);

    // Drop table
    await queryInterface.dropTable('shipment-shop-products');
  },
};
