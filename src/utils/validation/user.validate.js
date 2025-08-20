/**
 * @filename user.validate.js
 * @description This file defines a Joi schema for validating user data.  It ensures data integrity by specifying data types, required fields,
 * and implementing validation rules for various user attributes like name, mobile number, location (latitude and longitude), password, and
 * language preferences.  Custom error messages enhance user experience by providing clear and informative feedback.
 *
 * @version v1.0.0
 * @created Aug 20, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Joi = require("joi");

exports.createUserDataSchema = Joi.object({
  name: Joi.string().required(),
  mobileNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.empty": "Mobile Number is required.",
      "string.pattern.base":
        "Mobile number must be a valid format with country code.",
    }),

  languagePreference: Joi.string()
    .required()
    .messages({ "string.empty": "Language Preference is required." }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude cannot be less than -90",
    "number.max": "Latitude cannot be greater than 90",
    "any.required": "Latitude is required",
  }),

  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude cannot be less than -180",
    "number.max": "Longitude cannot be greater than 180",
    "any.required": "Longitude is required",
  }),
});

exports.updateUserDataSchema = Joi.object({
  home: Joi.string(),
  familyName: Joi.string(),
  pinCode: Joi.string(),
  profileImage: Joi.string()
    .uri()
    .messages({ "string.uri": "profile image should be an url." }),
  latitude: Joi.number().min(-90).max(90).messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude cannot be less than -90",
    "number.max": "Latitude cannot be greater than 90",
  }),

  longitude: Joi.number().min(-180).max(180).messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude cannot be less than -180",
    "number.max": "Longitude cannot be greater than 180",
  }),
});

exports.updateLanguageSchema = Joi.object({
  preferredLanguage: Joi.string()
    .required()
    .valid("English", "Kannada")
    .messages({
      "string.required": "The language field is required.",
      "string.only": "Language must be either English or Kannada",
    }),
});

exports.passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, and a number",
    }),
});

exports.updatePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, and a number",
    }),
  newPassword: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, and a number",
    }),
});
