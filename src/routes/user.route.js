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
  validate(userDataValidation.createUserDataSchema),
  userController.addUser
);

router.get("/:userId", authMiddleware, userController.getUserDetails);

router.put(
  "/update-profile/:userId",
  authMiddleware,
  validate(userDataValidation.updateUserDataSchema),
  userController.updateProfile
);

router.patch(
  "/language-change",
  authMiddleware,
  validate(userDataValidation.updateLanguageSchema),
  userController.updateLanguagePreferrence
);

router.patch("/change-role", authMiddleware, userController.changeUserRole);

router.patch(
  "/add-password",
  authMiddleware,
  validate(userDataValidation.passwordSchema),
  userController.addPassword
);

module.exports = router;
