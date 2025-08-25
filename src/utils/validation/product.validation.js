const Joi = require("joi");

exports.productUpdateValidation = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "string.empty": "Product name should not be empty." }),
  price: Joi.string().min(0).required().messages({
    "string.empty": "Product price should not be empty",
    "string.min": "Product price should be greater than 0.",
  }),
  imageUrl: Joi.string().uri().messages({
    "string.empty": "The image url should not be empty",
    "string.uri": "Product image should be an url",
  }),
  categoryId: Joi.string()
    .required()
    .messages({ "string.empty": "Category id should not be empty" }),
});
