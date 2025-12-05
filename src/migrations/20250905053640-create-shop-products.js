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
    await queryInterface.createTable('shop-products', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      shopId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'shops', key: 'id' },
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
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('accepted', 'rejected', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      quality: {
        type: Sequelize.ENUM('premium', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium',
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    await queryInterface.addConstraint('shop-products', {
      fields: ['shopId'],
      type: 'foreign key',
      name: 'fk_shop_products_shop',
      references: { table: 'shops', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('shop-products', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_shop_products_product',
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes
    await queryInterface.addIndex('shop-products', ['shopId']);
    await queryInterface.addIndex('shop-products', ['productId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove constraints first
    await queryInterface.removeConstraint('shop-products', 'fk_shop_products_shop');
    await queryInterface.removeConstraint('shop-products', 'fk_shop_products_product');

    // Remove indexes
    await queryInterface.removeIndex('shop-products', ['shopId']);
    await queryInterface.removeIndex('shop-products', ['productId']);

    // Drop table
    await queryInterface.dropTable('shop-products');

    // Drop ENUM types to prevent duplication errors
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_shop_products_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_shop_products_quality"`);
  },
};
