/**
 * @filename user.controller.js
 * @description This file houses the controller logic for user-related operations.  It handles requests for user creation, profile updates,
 * authentication, and administrative tasks such as role changes and user listing. The controller acts as an intermediary between incoming
 * requests and the underlying user service layer, ensuring proper error handling and response formatting.
 *
 * @version v1.0.0
 * @updated Aug 21, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const userServices = require("../services/user.services");
const logger = require("../utils/logger");

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

exports.addUser = async (req, res) => {
  const { name, mobileNumber, languagePreference, latitude, longitude, role } =
    req.body;

  try {
    const user = await userServices.getUserByMobileNumber(mobileNumber);
    if (user !== null)
      return res
        .status(400)
        .json({ message: "User already exists.", userExists: true });
    await userServices.addUser({
      name,
      mobileNumber,
      languagePreference,
      latitude,
      longitude,
      role,
    });
    res
      .status(201)
      .json({ message: "The user has been created successfully." });
  } catch (error) {
    logger.error(`Error while adding user to the db: ${error}`);
    res
      .status(500)
      .json({ message: "Internal error while adding user.", error });
  }
};

exports.getUserDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userServices.getUserByID(userId);
    res
      .status(200)
      .json({ message: "User details fetched successfully.", user });
  } catch (error) {
    logger.error(`Error while retrieving user detail: ${error}`);
    res.status(500).json({
      message: "Internal error while retrieving user details.",
      error,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  try {
    await userServices.updateUserDetails({ userId, data });
    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    logger.error(`Internal error while updating the user: ${error}`);
    res.status(500).json({
      message: "Internal error while updating the user details.",
      error,
    });
  }
};

exports.updateLanguagePreferrence = async (req, res) => {
  const userId = req.user.id;
  const { preferredLanguage } = req.body;
  try {
    await userServices.setPreferredLanguage(userId, preferredLanguage);
    res
      .status(200)
      .json({ message: "The system language has been set successfully." });
  } catch (error) {
    logger.error(
      `Internal error while updating preferred language.
        ${error}`
    );
    res
      .status(500)
      .json({ message: "Internal error while updating the user details." });
  }
};

exports.changeUserRole = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    await userServices.changeUserRole(userId, userRole);
    res.status(200).json({ message: "User role has changed successfully." });
  } catch (error) {
    logger.error(`Internal error while changing the user role. ${error}`);
    res
      .status(500)
      .json({ message: "Internal error while changing user role." });
  }
};

exports.addPassword = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;
  try {
    await userServices.addPassword(userId, password);
    res
      .status(200)
      .json({ message: "Added password to the user successfully." });
  } catch (error) {
    logger.error(`Internal error while adding password: ${error}`);
    res.status(500).json({
      message: "Internal error while adding password.",
      error: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  try {
    await userServices.updatePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: "User password updated successfully." });
  } catch (error) {
    logger.error(`Internal error while updating password: ${error}`);
    res.status(500).json({
      message: "Internal error while updating password.",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userServices.getAllUsers();
    res
      .status(200)
      .json({ message: "Retrieved all users successfully.", users });
  } catch (error) {
    logger.error(`Internal error while getting all users: ${error}`);
    res.status(500).json({
      message: "Internal error while getting users.",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  try {
    await userServices.logoutUser(idToken);
    res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    logger.error(`Internal error while logging out the user: ${error}`);
    res.status(500).json({
      message: "Internal error while logging out.",
      error: error.message,
    });
  }
};

exports.getUsersByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const users = await userServices.getUsersByStatus(status);
    res
      .status(200)
      .json({ message: "✅ Users fetched by status successfully!", users });
  } catch (error) {
    logger.error(`Internal error while fetching users' by status: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching users by status. Please try again later.",
      error: error.message,
    });
  }
};

exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await userServices.getUserByRole(role);
    res
      .status(200)
      .json({ message: "✅ Users fetched by role successfully!", users });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while getting users by role: ${error}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching users by role. Please try again later.",
      error: error.message,
    });
  }
};
