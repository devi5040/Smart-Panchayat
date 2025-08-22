const router = require("express").Router();
const categoryController = require("../controllers/category.controller");

const validate = require("../middleware/validation.middleware");
const authMiddleware = require("../middleware/firebaseAuthMiddleware");
const {
  fileUploadSchema,
} = require("../utils/validation/fileUploadValidation");

router.get(
  "/",
  authMiddleware,
  validate(fileUploadSchema),
  categoryController.getAllCategories
);

module.exports = router;
