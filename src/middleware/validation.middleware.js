/**
 * @filename validation.middleware.js
 * @description This module exports a middleware function for validating incoming request bodies against a given Joi schema.
 * It intercepts requests, validates the request body using the provided schema, and returns a 400 Bad Request response with the validation
 * error message if validation fails. Otherwise, it proceeds to the next middleware function.
 *
 * @version v1.0.0
 * @created August 19, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

module.exports = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((err) => err.message), // show all errors
      });
    }

    next();
  };
};
