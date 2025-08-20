/**
 * @filename user.services.js
 * @description This module provides a function to upload files to an AWS S3 bucket.  It generates a pre-signed URL for secure file uploads and
 * returns both the signed URL and the final public URL of the uploaded file.  Error handling is included to manage issues during URL
 * generation.
 *
 * @version v1.0.0
 * @created Aug 19 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const s3 = require("../config/aws/aws.s3.config");
const { Users } = require("../models");
const logger = require("../utils/logger");

exports.getSignedUrlS3 = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/profiles/${Date.now()}-${fileName}`,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const signedURL = await s3.getSignedUrlPromise("putObject", params);
    return {
      signedURL,
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
  } catch (error) {
    throw new Error(
      `Error in services generating signed URL: ${error.message}`
    );
  }
};

exports.addUser = async ({
  name,
  mobileNumber,
  languagePreference,
  latitude,
  longitude,
  role,
}) => {
  try {
    await Users.create({
      phone_number: mobileNumber,
      user_name: name,
      language_preference: languagePreference,
      latitude,
      longitude,
      role,
    });
    logger.info("User created successfully");
  } catch (error) {
    logger.error(`Error while creating user: ${error}`);
    throw error;
  }
};

exports.getUserByMobileNumber = async (mobileNumber) => {
  if (!mobileNumber) throw new Error("The mobile number is invalid.");
  try {
    const user = await Users.findOne({
      where: { phone_number: mobileNumber },
    });
    return user;
  } catch (error) {
    logger.error(
      `Error in services while retrieving user by mobile number: ${error}`
    );
    throw error;
  }
};

exports.getUserByID = async (id) => {
  if (id === null || id === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (id === null || id === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (id === 0) {
    return null;
  }
  try {
    const user = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return null;
    return user;
  } catch (error) {
    logger.error(`Error in services while retrieving user by ID: ${error}`);
    throw error;
  }
};

exports.updateUserDetails = async ({ userId, data }) => {
  if (userId === null || userId === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (userId === null || userId === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (userId === 0) {
    return null;
  }
  try {
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
      { where: { id: userId } }
    );
  } catch (error) {
    logger.error(
      `Internal error in services occured while updating the user: ${error}`
    );
    throw error;
  }
};

exports.setPreferredLanguage = async (userId, prefferedLanguage) => {
  if (userId === null || userId === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (userId === null || userId === undefined) {
    throw new Error("Invalid user ID: ID cannot be null or undefined");
  }
  if (userId === 0) {
    return null;
  }
  try {
    await Users.update(
      { language_preference: prefferedLanguage },
      { where: { id: userId } }
    );
  } catch (error) {
    logger.error(
      `Internal error in services occured while setting preferred language: ${error}`
    );
    throw error;
  }
};

exports.changeUserRole = async (userId, currentRole) => {
  let userRole;
  if (currentRole === "user") userRole = "shop";
  else userRole = "user";
  try {
    await Users.update({ user_role: userRole }, { where: { id: userId } });
  } catch (error) {
    logger.error(
      `Internal error in services while changing user role. ${error}`
    );
    throw error;
  }
};
