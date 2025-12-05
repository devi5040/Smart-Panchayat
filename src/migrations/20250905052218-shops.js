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
        allowNull: true,
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

    await queryInterface.addConstraint('shops', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_shops_userId',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('shops', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove FK constraint
    await queryInterface.removeConstraint('shops', 'fk_shops_userId');

    // Remove index
    await queryInterface.removeIndex('shops', ['userId']);

    // Drop table
    await queryInterface.dropTable('shops');

    // Cleanup ENUM to prevent duplicate ENUM errors
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_shops_priority"`);
  },
};
