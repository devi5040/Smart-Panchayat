const Joi = require('joi');

exports.productValidation = Joi.object({
  name: Joi.string().required().messages({ 'string.empty': 'Product name should not be empty.' }),
  price: Joi.string().min(0).required().messages({
    'string.empty': 'Product price should not be empty',
    'string.min': 'Product price should be greater than 0.',
  }),
  imageUrl: Joi.string().uri().messages({
    'string.empty': 'The image url should not be empty',
    'string.uri': 'Product image should be an url',
  }),
  categoryId: Joi.number()
    .required()
    .messages({ 'string.empty': 'Category id should not be empty' }),
  status: Joi.string().valid('accepted', 'rejected', 'pending').messages({
    'string.empty': 'Status should not be empty',
    'string.valid': 'Status should be accepted,rejected or pending.',
  }),
});

exports.statusValidation = Joi.object({
  status: Joi.string().valid('accepted', 'rejected', 'pending').messages({
    'string.empty': 'Status should not be empty',
    'string.valid': 'Status should be accepted,rejected or pending.',
  }),
});

exports.productShopSchema = Joi.object({
  name: Joi.string(),
  quality: Joi.string().valid('premium', 'high', 'medium'),
  quantity: Joi.number().min(1).required(),
  image: Joi.string().uri(),
  price: Joi.number().min(1).required(),
  shopId: Joi.number().required(),
  productId: Joi.number(),
  categoryId: Joi.number(),
  date: Joi.date(),
});

exports.updateProductShopSchema = Joi.object({
  quality: Joi.string().valid('premium', 'high', 'medium'),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(1).required(),
  date: Joi.date(),
});
