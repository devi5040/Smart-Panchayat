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
    await queryInterface.createTable('order-items', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      product_quality: {
        type: Sequelize.ENUM('premium', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium',
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
    await queryInterface.addConstraint('order-items', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_order_items_order',
      references: { table: 'orders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('order-items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_order_items_product',
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('order-items', ['orderId']);
    await queryInterface.addIndex('order-items', ['productId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove foreign key constraints first
    await queryInterface.removeConstraint('order-items', 'fk_order_items_order');
    await queryInterface.removeConstraint('order-items', 'fk_order_items_product');

    // Remove indexes
    await queryInterface.removeIndex('order-items', ['orderId']);
    await queryInterface.removeIndex('order-items', ['productId']);

    // Drop table
    await queryInterface.dropTable('order-items');

    // Drop ENUM to prevent duplication on re-migration
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_order_items_product_quality"`);
  },
};
