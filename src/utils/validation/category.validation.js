/**
 * @filename category.validation.js
 * @description This file defines a Joi schema for validating category data.  It ensures that category objects have a non-empty name and a
 * valid imageUrl.  The schema provides user-friendly error messages for validation failures.
 *
 * @version v1.0.0
 * @updated August 22, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const Joi = require('joi');

exports.categoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({ 'string.required': 'Category name cannot be empty' }),
  imageUrl: Joi.string().uri().messages({
    'string.uri': 'The imageUrl should be an url.',
  }),
});
