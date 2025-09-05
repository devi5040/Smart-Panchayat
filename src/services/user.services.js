/**
 * @filename user.services.js
 * @description This file provides a comprehensive set of services for managing user accounts and data. It handles user creation, retrieval,
 * updates (including profile details, language preferences, roles, and passwords), and also facilitates secure S3 file uploads for profile
 * images.  Additionally, it offers user logout functionality via Firebase Admin SDK.
 *
 * @version v1.0.0
 * @updated Thu Aug 21 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const s3 = require('../config/aws/aws.s3.config');
const { Users } = require('../models');
const admin = require('firebase-admin');
const { encryptPassword, comparePasswords } = require('../utils/hashPassword');
const { NotFoundError, BadRequestError } = require('../utils/error');

exports.getSignedUrlS3 = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/profiles/${Date.now()}-${fileName}`,
    ContentType: fileType,
    ACL: 'public-read',
  };
  const signedURL = await s3.getSignedUrlPromise('putObject', params);
  return {
    signedURL,
    fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
  };
};

exports.addUser = async ({ name, mobileNumber, languagePreference, latitude, longitude, role }) => {
  const data = await Users.create({
    phone_number: mobileNumber,
    user_name: name,
    language_preference: languagePreference,
    latitude,
    longitude,
    role,
  });
  return data;
};

exports.getUserByMobileNumber = async (mobileNumber) => {
  if (!mobileNumber) throw new Error('The mobile number is invalid.');
  const user = await Users.findOne({
    where: { phone_number: mobileNumber },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

exports.getUserByID = async (id) => {
  if (id === null || id === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (id === null || id === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (id === 0) {
    return null;
  }
  const user = await Users.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) throw new Error('User not found');
  return user;
};

exports.updateUserDetails = async ({ userId, data }) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  await Users.update(
    {
      home_address: data.home,
      family_name: data.familyName,
      pin_code: data.pinCode,
      profile_image: data.profileImage,
      password: data.password,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    { where: { id: userId } },
  );
};

exports.setPreferredLanguage = async (userId, prefferedLanguage) => {
  if (userId === null || userId === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (userId === 0) {
    throw new Error('Invalid user ID: must not be 0');
  }
  await Users.update({ language_preference: prefferedLanguage }, { where: { id: userId } });
  return true;
};

exports.changeUserRole = async (userId, currentRole) => {
  let userRole;
  if (userId === null || userId === undefined) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  if (userId === 0) {
    return null;
  }
  if (currentRole === 'user') userRole = 'shop';
  else userRole = 'user';
  await Users.update({ user_role: userRole }, { where: { id: userId } });
};

exports.addPassword = async (userId, password) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
  const hashedPassword = await encryptPassword(password);
  const currentPassword = await Users.findByPk(userId, {
    attributes: ['password'],
  });
  if (currentPassword.password !== null) {
    throw new Error('User already has a password. Please select update password.');
  }
  await Users.update({ password: hashedPassword }, { where: { id: userId } });
};

exports.updatePassword = async (userId, oldPassword, newPassword) => {
  if (userId === null || userId === undefined || userId == 0) {
    throw new Error('Invalid user ID: ID cannot be null or undefined');
  }
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
  await Users.update({ password: newHashedPassword }, { where: { id: userId } });
};

exports.getAllUsers = async () => {
  const users = await Users.findAll();
  if (!users) throw new NotFoundError('users not found');
  return users;
};

exports.logoutUser = async (idToken) => {
  if (!idToken) throw new Error('No token provided.');
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken.uid;
  await admin.auth().revokeRefreshTokens(uid);
  return true;
};

exports.getUsersByStatus = async (status) => {
  if (!status) throw new Error('status is not provided');
  if (status !== 'active' && status !== 'inactive')
    throw new BadRequestError('Status should either be active or inactive.');
  const users = await Users.findAll({ where: { account_status: status } });
  if (!users) throw new Error('Users data is invalid');
  return users;
};

exports.getUserByRole = async (role) => {
  if (!role) throw new Error('User role is not provided');
  if (role !== 'user' && role !== 'shop' && role !== 'admin' && role !== 'agent')
    throw new BadRequestError('User role provided is invalid');
  const users = await Users.findAll({ where: { user_role: role } });
  if (!users) throw new Error('Users data is invalid');
  return users;
};

exports.verifyUser = async (decodedToken) => {
  let user = await Users.findOne({ where: { firebaseUid: decodedToken.uid } });
  if (!user) {
    user = await Users.create({
      firebaseUid: decodedToken.uid,
      phone_number: decodedToken.phone_number,
    });
  }
  return user;
};
