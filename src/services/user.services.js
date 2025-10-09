/**
 * @filename user.services.js
 * @description This file provides services for managing user accounts.  It handles user creation, retrieval, updates (including profile details, preferences, roles,
 * and passwords), secure profile image uploads, and Firebase-based logout.
 *
 * @version v1.0.0
 * @updated Thu Aug 21 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const s3 = require('../config/aws/aws.s3.config');
const { Users, Shops } = require('../models'); // Sequelize model for Users
const admin = require('firebase-admin');
const { encryptPassword, comparePasswords } = require('../utils/hashPassword');
const { NotFoundError, BadRequestError, NoContentError } = require('../utils/error');
const sequelize = require('../config/db');

/**
 * Generates a pre-signed URL for uploading a profile image to AWS S3.
 * @async
 * @param {string} fileName - The name of the file to be uploaded.
 * @param {string} fileType - The MIME type of the file.
 * @returns {Promise<{signedURL: string, fileUrl: string}>} - An object containing the pre-signed URL and the final file URL.
 * @throws {Error} - If the signed URL could not be generated.
 */
exports.getSignedUrlS3 = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/profiles/${Date.now()}-${fileName}`,
    ContentType: fileType,
    // ACL: 'public-read',
  };
  const signedURL = await s3.getSignedUrlPromise('putObject', params);
  if (!signedURL) throw new Error('Could not generate signedUrl');
  return {
    signedURL,
    fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
  };
};

/**
 * Adds a new user or updates an existing user's details if the user already exists based on firebaseUid.
 * @async
 * @param {object} userData - An object containing user data.
 * @param {string} userData.name - The user's name.
 * @param {string} userData.firebaseUid - The user's Firebase UID.
 * @param {string} userData.languagePreference - The user's preferred language.
 * @param {number} userData.latitude - The user's latitude.
 * @param {number} userData.longitude - The user's longitude.
 * @param {string} userData.role - The user's role.
 * @returns {Promise<object>} - The Sequelize User model instance after update or creation.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.addUser = async ({ name, firebaseUid, languagePreference, latitude, longitude, role }) => {
  const [numRowsUpdated] = await Users.update(
    {
      user_name: name,
      language_preference: languagePreference,
      latitude,
      longitude,
      user_role: role,
    },
    { where: { firebaseUid } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findOne({ where: { firebaseUid } });
  return data;
};

/**
 * Retrieves a user by their mobile number.
 * @async
 * @param {string} mobileNumber - The user's mobile number.
 * @returns {Promise<object>} - The Sequelize User model instance.
 * @throws {Error} - If the mobile number is invalid.
 * @throws {NotFoundError} - If the user is not found.
 */
exports.getUserByMobileNumber = async (mobileNumber) => {
  if (!mobileNumber) throw new Error('The mobile number is invalid.');
  const user = await Users.findOne({
    where: { phone_number: mobileNumber },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

/**
 * Retrieves a user by their ID.
 * @async
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} - The Sequelize User model instance.  Password attribute is excluded.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NotFoundError} - If the user is not found.
 */
exports.getUserByID = async (id) => {
  if (id === null || id === undefined || id == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  const user = await Users.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

/**
 * Updates a user's details.
 * @async
 * @param {number} userId - The ID of the user to update.
 * @param {object} data - An object containing the user data to update.
 * @param {string} data.home - The user's home address.
 * @param {string} data.familyName - The user's family name.
 * @param {string} data.pinCode - The user's pin code.
 * @param {string} data.profileImage - The URL of the user's profile image.
 * @param {string} data.password - The user's password (will be encrypted).
 * @param {number} data.latitude - The user's latitude.
 * @param {number} data.longitude - The user's longitude.
 * @returns {Promise<object>} - The updated Sequelize User model instance.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.updateUserDetails = async ({ userId, data }) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  const [numRowsUpdated] = await Users.update(
    {
      home_address: data.home,
      family_name: data.familyName,
      pin_code: data.pinCode,
      profile_image: data.profileImage,
      password: data.password, // This will be handled by encryptPassword util
      latitude: data.latitude,
      longitude: data.longitude,
    },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows are updated!');
  const user = await Users.findByPk(userId);
  return user;
};

/**
 * Sets a user's preferred language.
 * @async
 * @param {number} userId - The ID of the user.
 * @param {string} prefferedLanguage - The preferred language.
 * @returns {Promise<object>} - The updated Sequelize User model instance.  Returns only specified attributes.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NotFoundError} - If the user is not found.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.setPreferredLanguage = async (userId, prefferedLanguage) => {
  if (userId === null || userId === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (userId === 0) {
    throw new Error('Invalid user ID: must not be 0');
  }
  const userData = await Users.findByPk(userId);
  if (!userData) throw new NotFoundError('User not found!');
  const [numRowsUpdated] = await Users.update(
    { language_preference: prefferedLanguage },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows are updated!');
  const user = await Users.findByPk(userId, {
    attributes: [
      'id',
      'phone_number',
      'user_name',
      'user_role',
      'account_status',
      'language_preference',
    ],
  });
  return user;
};

/**
 * Changes a user's role.
 * @async
 * @param {number} userId - The ID of the user.
 * @param {string} currentRole - The user's current role.
 * @returns {Promise<object>} - The updated Sequelize User model instance. Returns only specified attributes.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NotFoundError} - If the user is not found.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.changeUserRole = async (userId, currentRole) => {
  let userRole;
  if (userId === null || userId === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (userId === 0) {
    return null;
  }
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  if (currentRole === 'user') userRole = 'shop';
  else userRole = 'user';
  const [numRowsUpdated] = await Users.update({ user_role: userRole }, { where: { id: userId } });
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findByPk(userId, {
    attributes: [
      'id',
      'phone_number',
      'user_name',
      'user_role',
      'account_status',
      'language_preference',
      'home_address',
      'family_name',
      'pin_code',
      'profile_image',
      'latitude',
      'longitude',
    ],
  });
  return data;
};

/**
 * Adds a password to a user's account.
 * @async
 * @param {number} userId - The ID of the user.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The updated Sequelize User model instance. Returns only specified attributes.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NotFoundError} - If the user is not found.
 * @throws {Error} - If the user already has a password.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.addPassword = async (userId, password) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const hashedPassword = await encryptPassword(password);
  const currentPassword = await Users.findByPk(userId, {
    attributes: ['password'],
  });
  if (currentPassword.password !== null) {
    throw new Error('User already has a password. Please select update password.');
  }
  const [numRowsUpdated] = await Users.update(
    { password: hashedPassword },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findByPk(userId, {
    attributes: [
      'id',
      'phone_number',
      'user_name',
      'user_role',
      'account_status',
      'language_preference',
    ],
  });
  return data;
};

/**
 * Updates a user's password.
 * @async
 * @param {number} userId - The ID of the user.
 * @param {string} oldPassword - The user's old password.
 * @param {string} newPassword - The user's new password.
 * @returns {Promise<object>} - The updated Sequelize User model instance. Returns only specified attributes.
 * @throws {Error} - If the user ID is invalid.
 * @throws {NotFoundError} - If the user is not found.
 * @throws {Error} - If the old password does not match.
 * @throws {Error} - If the new password is the same as the old password.
 * @throws {NoContentError} - If no rows were updated.
 */
exports.updatePassword = async (userId, oldPassword, newPassword) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const currentUser = await Users.findByPk(userId, {
    attributes: ['password'],
  });
  const passwordMatch = await comparePasswords(oldPassword, currentUser.password);
  if (!passwordMatch) {
    throw new Error("The old password you entered doesn't match with the saved password.");
  }
  const newHashedPassword = await encryptPassword(newPassword);
  const isSamePassword = await comparePasswords(newPassword, currentUser.password);
  if (isSamePassword) {
    throw new Error(
      'You cannot enter same password as previous password. Please change new password.',
    );
  }
  const [numRowsUpdated] = await Users.update(
    { password: newHashedPassword },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findByPk(userId, {
    attributes: [
      'id',
      'phone_number',
      'user_name',
      'user_role',
      'account_status',
      'language_preference',
    ],
  });
  return data;
};

/**
 * Retrieves all users.
 * @async
 * @returns {Promise<object[]>} - An array of Sequelize User model instances.
 * @throws {NotFoundError} - If no users are found.
 */
exports.getAllUsers = async () => {
  const users = await Users.findAll();
  if (!users) throw new NotFoundError('users not found');
  return users;
};

/**
 * Logs out a user by revoking their refresh tokens.
 * @async
 * @param {string} idToken - The user's Firebase ID token.
 * @returns {Promise<boolean>} - True if the logout was successful.
 * @throws {Error} - If no token is provided.
 */
exports.logoutUser = async (idToken) => {
  if (!idToken) throw new Error('No token provided.');
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken.uid;
  await admin.auth().revokeRefreshTokens(uid);
  return true;
};

/**
 * Retrieves users by their account status.
 * @async
 * @param {string} status - The account status ("active" or "inactive").
 * @returns {Promise<object[]>} - An array of Sequelize User model instances.
 * @throws {Error} - If the status is not provided or invalid.
 * @throws {BadRequestError} - If the status is not "active" or "inactive".

 */
exports.getUsersByStatus = async (status) => {
  if (!status) throw new Error('status is not provided');
  if (status !== 'active' && status !== 'inactive')
    throw new BadRequestError('Status should either be active or inactive.');
  const users = await Users.findAll({ where: { account_status: status } });
  if (!users) throw new Error('Users data is invalid');
  return users;
};

/**
 * Retrieves users by their role.
 * @async
 * @param {string} role - The user role ("user", "shop", "admin", or "agent").
 * @returns {Promise<object[]>} - An array of Sequelize User model instances.
 * @throws {Error} - If the role is not provided or invalid.
 * @throws {BadRequestError} - If the role is not one of the valid roles.
 */
exports.getUserByRole = async (role) => {
  if (!role) throw new Error('User role is not provided');
  if (role !== 'user' && role !== 'shop' && role !== 'admin' && role !== 'agent')
    throw new BadRequestError('User role provided is invalid');
  const users = await Users.findAll({ where: { user_role: role } });
  if (!users) throw new Error('Users data is invalid');
  return users;
};

/**
 * Verifies a user using their decoded Firebase token. Creates a new user if one doesn't exist.
 * @async
 * @param {object} decodedToken - The decoded Firebase ID token.  Must contain `uid` and `phone_number` properties.
 * @returns {Promise<object>} - The Sequelize User model instance.
 */
exports.verifyUser = async (decodedToken) => {
  console.log('connected to db:', sequelize.getDatabaseName());
  console.log(decodedToken.uid);
  let user = await Users.findOne({ where: { firebaseUid: decodedToken.uid } });
  if (!user) {
    user = await Users.create({
      firebaseUid: decodedToken.uid,
      phone_number: decodedToken.phone_number,
    });
  }
  return user;
};

/**
 * Checks if a user exists in the database based on their Firebase UID.
 * Returns `true` if the user exists and has `user_name`, `latitude`, and `longitude` set.
 * Returns `false` if the user exists but these fields are missing.
 * Throws a `NotFoundError` if the user does not exist.
 *
 * @async
 * @param {string} firebaseUid - The Firebase UID of the user to check.
 * @returns {Promise<boolean>} - `true` if user exists and has required fields, `false` otherwise.
 * @throws {NotFoundError} - If the user with the given `firebaseUid` does not exist.
 */
exports.checkUserExists = async (firebaseUid) => {
  const user = await Users.findOne({ where: { firebaseUid } });
  if (!user) throw new NotFoundError('User Not Found!');
  if (!user.user_name && !user.latitude && !user.longitude) return false;
  return true;
};

exports.deactivateAccount = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const [numRowsUpdated] = await Users.update(
    { account_status: 'inactive' },
    { where: { id: userId } },
  );
  if (numRowsUpdated === 0) throw new NoContentError('No rows updated!');
  const userData = await Users.findByPk(userId);
  return userData;
};

exports.checkShopExists = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User Not Found!');
  const shop = await Shops.findOne({ where: { userId } });
  console.log(JSON.stringify(shop));
  if (!shop.shop_name && shop.userId === userId) {
    console.log(`inside the shop`);
    return false;
  }
  return true;
};
