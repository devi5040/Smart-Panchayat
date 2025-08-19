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
    throw new Error(`Error generating signed URL: ${error.message}`);
  }
};
