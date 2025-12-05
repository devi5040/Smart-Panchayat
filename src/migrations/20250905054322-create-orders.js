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
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('paid', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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

    // Add named foreign key constraints
    await queryInterface.addConstraint('orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_orders_user',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('orders', {
      fields: ['collectionCentreId'],
      type: 'foreign key',
      name: 'fk_orders_collectionCentre',
      references: {
        table: 'collection-centres',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes for better performance
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['collectionCentreId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove FK constraints first
    await queryInterface.removeConstraint('orders', 'fk_orders_user');
    await queryInterface.removeConstraint('orders', 'fk_orders_collectionCentre');

    // Remove indexes
    await queryInterface.removeIndex('orders', ['userId']);
    await queryInterface.removeIndex('orders', ['collectionCentreId']);

    // Drop table
    await queryInterface.dropTable('orders');

    // Drop ENUM to prevent duplication errors on re-migration
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_orders_payment_status"`);
  },
};
