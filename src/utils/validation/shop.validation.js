const Joi = require('joi');

exports.productDataSchema = Joi.object({
  name: Joi.string().required().min(3).messages({
    'string.empty': 'Shop name should not be empty.',
    'string.min': 'Shop name should consist at least 3 letters',
  }),
  pinCode: Joi.string().messages({
    'string.empty': 'Pin code should not be empty',
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude cannot be less than -90',
    'number.max': 'Latitude cannot be greater than 90',
    'any.required': 'Latitude is required',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude cannot be less than -180',
    'number.max': 'Longitude cannot be greater than 180',
    'any.required': 'Longitude is required',
  }),
});

exports.remarksSchema = Joi.object({
  remarks: Joi.string().required().messages({
    'string.empty': 'Remarks should not be empty',
    'string.required': 'Remarks is required',
  }),
});
