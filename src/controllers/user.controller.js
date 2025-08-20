/**
 * @filename user.controller.js
 * @description This file provides an API endpoint for generating pre-signed URLs to upload files to Amazon S3.  It receives a filename and file
 * type from the request body, uses the `userServices` module to generate the S3 upload URL, and returns the result to the client.
 * Error handling is included to gracefully manage exceptions during the process.
 *
 * @version v1.0.0
 * @created August 19, 2025
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
