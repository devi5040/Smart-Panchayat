/**
 * @filename user.controller.js
 * @description This controller manages all user-related actions.  It handles requests for user creation, profile updates, password management,  authentication, and
 * administrative tasks like role changes and user listing. It acts as a bridge between incoming requests and the user service layer, ensuring responses are properly
 * formatted and errors are handled gracefully.
 *
 * @version v1.0.0
 * @updated Aug 21, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const userServices = require('../services/user.services');
const logger = require('../utils/logger');

/**
 * @async
 * @function getSignedURL
 * @description Gets a pre-signed URL from S3 for file upload.
 * @param {object} req - The Express request object.
 * @param {object} req.body - Request body containing fileName and fileType.
 * @param {string} req.body.fileName - The name of the file.
 * @param {string} req.body.fileType - The type of the file.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error getting the signed URL.  Error details are logged.
 */
exports.getSignedURL = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const result = await userServices.getSignedUrlS3(fileName, fileType);

    res.status(200).json({ ...result });
  } catch (error) {
    logger.error(`Error while getting signed URL: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @async
 * @function addUser
 * @description Adds a new user to the database. Uses Sequelize model's `create` method.
 * @param {object} req - The Express request object.
 * @param {object} req.body - Request body containing user data.
 * @param {string} req.body.firebaseUid - Firebase UID of the user.
 * @param {string} req.body.name - Name of the user.
 * @param {string} req.body.mobileNumber - Mobile number of the user.
 * @param {string} req.body.languagePreference - Language preference of the user.
 * @param {number} req.body.latitude - Latitude of the user's location.
 * @param {number} req.body.longitude - Longitude of the user's location.
 * @param {string} req.body.role - Role of the user.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error adding the user. Error details are logged and a 500 status code is returned.  Specific Sequelize errors might be handled differently depending on their nature.
 */
exports.addUser = async (req, res) => {
  const { firebaseUid, name, mobileNumber, languagePreference, latitude, longitude, role } =
    req.body;

  try {
    const user = await userServices.addUser({
      name,
      firebaseUid,
      languagePreference,
      latitude,
      longitude,
      role,
    });
    res.status(201).json({ message: 'The user has been created successfully.', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error while adding user to the db: ${error}`);
    res.status(status).json({ message: 'Internal error while adding user.', error });
  }
};

/**
 * @async
 * @function getUserDetails
 * @description Retrieves user details from the database by ID. Uses Sequelize model's `findByPk` or similar method.
 * @param {object} req - The Express request object.
 * @param {string} req.params.userId - The ID of the user to retrieve.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error retrieving the user. Error details are logged and a 500 status code is returned.  Sequelize's `NotFoundError` might be handled separately for a more specific response.
 */
exports.getUserDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userServices.getUserByID(userId);
    res.status(200).json({ message: 'User details fetched successfully.', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Error while retrieving user detail: ${error}`);
    res.status(status).json({
      message: 'Internal error while retrieving user details.',
      error,
    });
  }
};

/**
 * @async
 * @function updateProfile
 * @description Updates user profile details in the database. Uses Sequelize model's `update` method.
 * @param {object} req - The Express request object.
 * @param {object} req.user - Contains the authenticated user's data (including ID).
 * @param {number} req.user.id - ID of the authenticated user.
 * @param {object} req.body - Request body containing the data to update.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error updating the user. Error details are logged and a 500 status code is returned.
 */
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  try {
    const user = await userServices.updateUserDetails({ userId, data });
    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating the user: ${error}`);
    res.status(status).json({
      message: 'Internal error while updating the user details.',
      error,
    });
  }
};

/**
 * @async
 * @function updateLanguagePreferrence
 * @description Updates the user's preferred language. Uses Sequelize model's `update` method.
 * @param {object} req - The Express request object.
 * @param {object} req.user - Contains the authenticated user's data (including ID).
 * @param {number} req.user.id - ID of the authenticated user.
 * @param {object} req.body - Request body containing the new preferred language.
 * @param {string} req.body.preferredLanguage - The new preferred language.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error updating the preferred language. Error details are logged and a 500 status code is returned.
 */
exports.updateLanguagePreferrence = async (req, res) => {
  const userId = req.user.id;
  const { preferredLanguage } = req.body;
  try {
    const user = await userServices.setPreferredLanguage(userId, preferredLanguage);
    res.status(200).json({
      message: 'The system language has been set successfully.',
      user,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while updating preferred language.
        ${error}`,
    );
    res.status(status).json({ message: 'Internal error while updating the user details.' });
  }
};

/**
 * @async
 * @function changeUserRole
 * @description Changes the user's role. Uses Sequelize model's `update` method.
 * @param {object} req - The Express request object.
 * @param {object} req.user - Contains the authenticated user's data (including ID and role).
 * @param {number} req.user.id - ID of the user whose role is to be changed.
 * @param {string} req.user.role - Current role of the user (potentially used for authorization checks).
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error changing the user role. Error details are logged and a 500 status code is returned.
 */
exports.changeUserRole = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; //Potentially used for authorization checks.
  try {
    const user = await userServices.changeUserRole(userId, userRole);
    res.status(200).json({ message: 'User role has changed successfully.', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while changing the user role. ${error}`);
    res.status(status).json({ message: 'Internal error while changing user role.' });
  }
};

/**
 * @async
 * @function addPassword
 * @description Adds a password to a user. Uses Sequelize model's `update` method.  Assumes password is hashed before storage.
 * @param {object} req - The Express request object.
 * @param {object} req.user - Contains the authenticated user's data (including ID).
 * @param {number} req.user.id - ID of the user.
 * @param {object} req.body - Request body containing the password.
 * @param {string} req.body.password - The password to add (presumably already hashed).
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error adding the password. Error details are logged and a 500 status code is returned.
 */
exports.addPassword = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;
  try {
    const user = await userServices.addPassword(userId, password);
    res.status(200).json({ message: 'Added password to the user successfully.', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while adding password: ${error}`);
    res.status(status).json({
      message: 'Internal error while adding password.',
      error: error.message,
    });
  }
};

/**
 * @async
 * @function updatePassword
 * @description Updates a user's password. Uses Sequelize model's `update` method.  Assumes password is hashed before storage.  Should include proper password verification.
 * @param {object} req - The Express request object.
 * @param {object} req.user - Contains the authenticated user's data (including ID).
 * @param {number} req.user.id - ID of the user.
 * @param {object} req.body - Request body containing old and new passwords.
 * @param {string} req.body.oldPassword - The old password (for verification).
 * @param {string} req.body.newPassword - The new password (presumably already hashed).
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error updating the password or password verification fails. Error details are logged and a 500 status code is returned.  Specific error handling for incorrect old password is recommended.
 */
exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await userServices.updatePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: 'User password updated successfully.', user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating password: ${error}`);
    res.status(status).json({
      message: 'Internal error while updating password.',
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getAllUsers
 * @description Retrieves all users from the database. Uses Sequelize model's `findAll` method.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error retrieving all users. Error details are logged and a 500 status code is returned.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userServices.getAllUsers();
    res.status(200).json({ message: 'Retrieved all users successfully.', users });
  } catch (error) {
    logger.error(`Internal error while getting all users: ${error}`);
    res.status(500).json({
      message: 'Internal error while getting users.',
      error: error.message,
    });
  }
};

/**
 * @async
 * @function logout
 * @description Logs out a user.  The implementation details depend on the authentication mechanism.
 * @param {object} req - The Express request object.
 * @param {string} req.headers.authorization - Authorization header containing the ID token.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error logging out the user. Error details are logged and a 500 status code is returned.
 */
exports.logout = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  try {
    await userServices.logoutUser(idToken);
    res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    logger.error(`Internal error while logging out the user: ${error}`);
    res.status(500).json({
      message: 'Internal error while logging out.',
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getUsersByStatus
 * @description Retrieves users by their status. Uses Sequelize model's `findAll` with a `where` clause.
 * @param {object} req - The Express request object.
 * @param {string} req.params.status - The status to filter users by.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error retrieving users by status. Error details are logged and a 500 status code is returned.
 */
exports.getUsersByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const users = await userServices.getUsersByStatus(status);
    res.status(200).json({ message: '✅ Users fetched by status successfully!', users });
  } catch (error) {
    logger.error(`Internal error while fetching users' by status: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while fetching users by status. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getUsersByRole
 * @description Retrieves users by their role. Uses Sequelize model's `findAll` with a `where` clause.
 * @param {object} req - The Express request object.
 * @param {string} req.params.role - The role to filter users by.
 * @param {object} res - The Express response object.
 * @throws {Error} If there's an error retrieving users by role. Error details are logged and a 500 status code is returned.
 */
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await userServices.getUserByRole(role);
    res.status(200).json({ message: '✅ Users fetched by role successfully!', users });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while getting users by role: ${error}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while fetching users by role. Please try again later.',
      error: error.message,
    });
  }
};
