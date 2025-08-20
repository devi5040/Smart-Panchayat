const router = require("express").Router();
const userController = require("../controllers/user.controller");

const authMiddleware = require("../middleware/firebaseAuthMiddleware");
//import validation middleware and schemas
const validate = require("../middleware/validation.middleware");
const fileUploadValidation = require("../utils/validation/fileUploadValidation");
const userDataValidation = require("../utils/validation/user.validate");

router.post(
  "/signed-url",
  validate(fileUploadValidation),
  userController.getSignedURL
);

router.post(
  "/",
  authMiddleware,
  validate(userDataValidation.userDataSchema),
  userController.addUser
);

module.exports = router;
