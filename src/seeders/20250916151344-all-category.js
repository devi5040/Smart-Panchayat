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
    await queryInterface.bulkInsert('categories', [
      {
        name_en: 'All',
        name_kn: 'ಎಲ್ಲಾ',
        imageUrl: 'https://infostoredeviprasadrai.s3.ap-southeast-2.amazonaws.com/uploads/all.png',
        createdAt: new Date(new Date()),
        updatedAt: new Date(new Date()),
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
