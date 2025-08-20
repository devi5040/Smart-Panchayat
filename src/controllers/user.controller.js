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
    const users = await userServices.getUserByMobileNumber(mobileNumber);
    if (users.length !== 0)
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
