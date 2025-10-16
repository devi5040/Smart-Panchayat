'use strict';

const admin = require('../config/firebase/firebase_config');

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

    async function getOrCreateFirebaseAdmin(phoneNumber) {
      let firebaseUser;

      try {
        // Try to get the user by phone number
        firebaseUser = await admin.auth().getUserByPhoneNumber(phoneNumber);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // User does not exist → create new user
          firebaseUser = await admin.auth().createUser({
            phoneNumber: phoneNumber,
            displayName: 'Deviprasad Rai',
          });
        } else {
          // Something else went wrong
          throw error;
        }
      }
      return firebaseUser;
    }

    const firebaseUser = await getOrCreateFirebaseAdmin('+919113624552');

    await queryInterface.bulkInsert('users', [
      {
        phone_number: firebaseUser.phoneNumber,
        user_name_en: 'Deviprasad Rai',
        user_name_kn: 'ದೇವಿಪ್ರಸಾದ್ ರೈ',
        home_address_en: '123, MG Road, Bangalore',
        home_address_kn: '123, ಎಂ ಜಿ ರೋಡ್,  ಬೆಂಗಳೂರು',
        family_name_en: 'Rai',
        family_name_kn: 'ರೈ',
        pin_code: '560001',
        language_preference: 'English',
        user_role: 'admin',
        latitude: '12.971598',
        longitude: '77.594566',
        firebaseUid: firebaseUser.uid,
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
