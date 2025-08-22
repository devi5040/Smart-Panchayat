const router = require("express").Router();
const categoryController = require("../controllers/category.controller");

const validate = require("../middleware/validation.middleware");
const authMiddleware = require("../middleware/firebaseAuthMiddleware");
const {
  fileUploadSchema,
} = require("../utils/validation/fileUploadValidation");
const {
  categoryValidationSchema,
} = require("../utils/validation/category.validation");

router.get("/", authMiddleware, categoryController.getAllCategories);

router.post(
  "/signed-url",
  authMiddleware,
  validate(fileUploadSchema),
  categoryController.getSignedUrl
);

router.post(
  "/",
  authMiddleware,
  validate(categoryValidationSchema),
  categoryController.addCategory
);

router.put(
  "/:categoryId",
  authMiddleware,
  validate(categoryValidationSchema),
  categoryController.updateCatogory
);

router.delete(
  "/:categoryId",
  authMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
