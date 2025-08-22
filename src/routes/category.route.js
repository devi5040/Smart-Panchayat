const router = require("express").Router();
const categoryController = require("../controllers/category.controller");

const validate = require("../middleware/validation.middleware");
const authMiddleware = require("../middleware/firebaseAuthMiddleware");
const {
  fileUploadSchema,
} = require("../utils/validation/fileUploadValidation");

router.get("/", authMiddleware, categoryController.getAllCategories);

router.post(
  "/signed-url",
  authMiddleware,
  validate(fileUploadSchema),
  categoryController.getSignedUrl
);

module.exports = router;
