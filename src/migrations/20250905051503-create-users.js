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
      user_name_en: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      user_name_kn: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      home_address_en: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      home_address_kn: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      family_name_en: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      family_name_kn: {
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
      collectionCentreId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'collection-centres',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
    // Add named constraint to avoid rollback errors
    await queryInterface.addConstraint('users', {
      fields: ['collectionCentreId'],
      type: 'foreign key',
      name: 'fk_users_collectionCentre',
      references: {
        table: 'collection-centres',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Add index for better performance
    await queryInterface.addIndex('users', ['collectionCentreId']);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove FK constraint first
    await queryInterface.removeConstraint('users', 'fk_users_collectionCentre');

    // Drop index
    await queryInterface.removeIndex('users', ['collectionCentreId']);

    // Drop the users table
    await queryInterface.dropTable('users');

    // Clean ENUM types (important!)
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_language_preference"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_account_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_user_role"`);
  },
};
