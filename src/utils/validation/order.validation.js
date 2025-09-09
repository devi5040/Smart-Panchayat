const Joi = require('joi');

const itemsSchema = Joi.object({
  quantity: Joi.number().required().min(1).messages({
    'string.requierd': 'The quantity should not be empty and it is required',
    'string.min': 'The minimum quantity should be 1',
  }),
  quality: Joi.string().valid('premium', 'high', 'medium').messages({
    'string.empty': 'Product quality cannot be empty.',
    'string.valid': 'The quality should either be premium, high or medium',
  }),
  productId: Joi.string()
    .required()
    .messages({ 'string.empty': 'The product id field cannot be empty.' }),
});

const orderDataSchema = Joi.object({
  collectionCentre: Joi.string().required().min(3).messages({
    'string.empty': 'collection centre should not be empty and it is required.',
    'string.min': 'Collection centre should have at least 3 letters.',
  }),
  paymentStatus: Joi.string().valid('pending', 'paid').messages({
    'string.empty': 'Payment status cannot be empty',
    'string.valid': 'Payment status should either be paid or pending',
  }),
  userId: Joi.string()
    .required()
    .messages({ 'string.required': 'The user id should not be empty.' }),
});

exports.orderSchema = Joi.object({
  orderData: orderDataSchema.required(),
  items: Joi.array().items(itemsSchema).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items field is required',
  }),
});

exports.paymentStatusOrderSchema = Joi.object({
  paymentStatus: Joi.string().valid('paid', 'pending').required().messages({
    'string.empty': 'Payment status cannot be empty',
    'any.valid': 'Payment status should either be paid or pending',
    'any.required': 'Payment Status field is required',
  }),
});
