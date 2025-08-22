const Joi = require("joi");

exports.categoryValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "string.required": "Category name cannot be empty" }),
  imageUrl: Joi.string().uri().messages({
    "string.uri": "The imageUrl should be an url.",
  }),
});
