'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('users', [
      {
        phone_number: '+919113624552',
        user_name: 'Deviprasad Rai',
        home_address: '123, MG Road, Bangalore',
        family_name: 'Rai',
        pin_code: '560001',
        language_preference: 'English',
        user_role: 'admin',
        latitude: '12.971598',
        longitude: '77.594566',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
