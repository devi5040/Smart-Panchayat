/**
 * @filename aws.s3.config.js
 * @description This module configures and exports an AWS S3 client object.  It uses environment variables to securely manage AWS credentials
 * and the region. This allows for easy interaction with Amazon S3 services within other parts of the application.
 *
 * @version v1.0.0
 * @created August 19, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

module.exports = s3;
