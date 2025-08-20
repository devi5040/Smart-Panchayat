const router = require("express").Router();
const userController = require("../controllers/user.controller");

//import validation middleware and schemas
const validate = require("../middleware/validation.middleware");
const fileUploadValidation = require("../utils/validation/fileUploadValidation");

router.post(
  "/signed-url",
  validate(fileUploadValidation),
  userController.getSignedURL
);

module.exports = router;
