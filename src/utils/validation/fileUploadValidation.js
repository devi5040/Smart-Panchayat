/**
 * @filename fileUploadValidation.js
 * @description This file defines a Joi schema for validating file uploads.  It ensures that uploaded files have a valid name,
 * file type (limited to JPEG, PNG, JPG, and WEBP images), and a size not exceeding 10MB.  This schema is crucial for maintaining data
 * integrity and preventing issues caused by improperly formatted or oversized uploads.
 *
 * @version v1.0.0
 * @created Aug 19 2025
 * @author <User name>
 */

const Joi = require("joi");

exports.fileUploadSchema = Joi.object({
  fileName: Joi.string().required(),
  fileType: Joi.string()
    .valid("image/jpeg", "image/png", "image/jpg", "image/webp")
    .required(),
  fileSize: Joi.number()
    .max(10 * 1024 * 1024)
    .required(),
});
