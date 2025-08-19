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
