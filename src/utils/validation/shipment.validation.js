const Joi = require('joi');

const shipmentProductSchema = Joi.object({
  quantity: Joi.number().required().min(1).messages({
    'number.empty': 'The quantity should not be empty',
    'number.min': 'The quantity should be more than 0',
    'any.required': 'The quantity field is required',
  }),
  productId: Joi.number().min(1).required().messages({
    'number.empty': 'The product id should not be empty',
    'number.min': 'Product id should be more than 0',
    'any.required': 'Product id field is required',
  }),
});

const shipmentShopSchema = Joi.object({
  shopId: Joi.number().required().min(1).messages({
    'number.empty': 'The shop id should be a valid number',
    'any.required': 'The shop id is required',
    'number.min': 'The shop id should be greater than 0',
  }),
  products: Joi.array().items(shipmentProductSchema).required().min(1).messages({
    'array.required': 'The shops array is required',
    'any.min': 'There should be atleast 1 shop',
  }),
});

exports.shipmentSchema = Joi.object({
  shipmentDetails: Joi.object({
    date: Joi.date().required().messages({
      'date.required': 'The date is required field',
      'any.date': 'Enter valid date',
    }),
    collectionCentreId: Joi.number().required().messages({
      'string.empty': 'The collection centre should not be empty',
      'any.required': 'The collection centre field is required',
    }),
    transportationMode: Joi.string().valid('truck', 'bus', 'train', 'other').required().messages({
      'string.empty': 'The transportation mode should not be empty',
      'any.required': 'The transportation mode is required',
      'any.valid': 'The transportation value is invalid',
    }),
    location: Joi.string().required(),
  }),
  shops: Joi.array().items(shipmentShopSchema).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items field is required',
  }),
});

exports.addShopToShipmentSchema = Joi.object({
  shopId: Joi.number().required().min(1).messages({
    'number.empty': 'The shop id should be a valid number',
    'any.required': 'The shop id is required',
    'number.min': 'The shop id should be greater than 0',
  }),
  shipmentId: Joi.number().required().min(1).messages({
    'number.empty': 'The shop id should be a valid number',
    'any.required': 'The shop id is required',
    'number.min': 'The shop id should be greater than 0',
  }),
  products: Joi.array().items(shipmentProductSchema).required().min(1).messages({
    'array.required': 'The shops array is required',
    'any.min': 'There should be atleast 1 shop',
  }),
});

exports.shipmentStatus = Joi.object({
  status: Joi.string().required().valid('pending', 'delivered').messages({
    'string.empty': 'The status should not be empty',
    'any.required': 'The status param is required',
    'any.valid': 'The status should either be pending or delivered. ',
  }),
});

exports.shipmentModeSchema = Joi.object({
  mode: Joi.string().valid('bus', 'train', 'truck', 'others').messages({
    'string.empty': 'The mode should not be empty',
    'any.valid': 'The mode should be bus,truck,train or others',
  }),
});

exports.shipmentProductUpdateSchema = Joi.object({
  shopId: Joi.number().required().min(1).messages({
    'number.empty': 'The shop id should be a valid number',
    'any.required': 'The shop id is required',
    'number.min': 'The shop id should be greater than 0',
  }),
  quantity: Joi.number().required().min(1).messages({
    'number.empty': 'The quantity should not be empty',
    'number.min': 'The quantity should be more than 0',
    'any.required': 'The quantity field is required',
  }),
  productId: Joi.number().min(1).required().messages({
    'number.empty': 'The product id should not be empty',
    'number.min': 'Product id should be more than 0',
    'any.required': 'Product id field is required',
  }),
});
