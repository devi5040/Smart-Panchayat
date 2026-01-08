/**
 * @filename category.route.js
 * @description This file defines the Express.js routes for managing categories.  It uses middleware for authentication (Firebase) and input
 * validation, ensuring secure and reliable handling of category creation, retrieval, updates, and deletion.  It also includes a route for
 * generating pre-signed URLs for file uploads, streamlining the process of adding images or other files associated with categories.
 *
 * @version v1.0.0
 * @updated August 22, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

// Import necessary modules
const express = require('express');
const router = express.Router(); // Create a router instance

const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller'); // Import category controller
const validate = require('../middleware/validation.middleware'); // Import validation middleware
const authMiddleware = require('../middleware/firebaseAuthMiddleware'); // Import Firebase authentication middleware
const access = require('../middleware/authorization.middleware');
const imageUpload = require('../middleware/image-upload.middleware');

// Import validation schemas
const { fileUploadSchema } = require('../utils/validation/fileUploadValidation');
const {
  categoryValidationSchema,
  updateCategoryValidationSchema,
} = require('../utils/validation/category.validation');

/**
 * @route GET /
 * @description Retrieves all categories.
 * @access Private (requires Firebase authentication)
 */
router.get('/', authMiddleware, categoryController.getAllCategories);

/**
 * @route POST /signed-url
 * @description Generates a pre-signed URL for file upload.
 * @access Private (requires Firebase authentication)
 * @middleware validate(fileUploadSchema): Validates file upload request body.
 */
router.post(
  '/signed-url',
  authMiddleware,
  access(['admin']),
  validate(fileUploadSchema),
  categoryController.getSignedUrl,
);

/**
 * @route POST /
 * @description Adds a new category.
 * @access Private (requires Firebase authentication)
 * @middleware validate(categoryValidationSchema): Validates category creation request body.
 */
router.post(
  '/',
  authMiddleware,
  access(['admin', 'shop']),
  imageUpload('category').single('image'),
  validate(categoryValidationSchema),
  categoryController.addCategory,
);

router.get(
  '/paginated',
  authMiddleware,
  access(['admin']),
  categoryController.fetchPaginatedCategories,
);

router.get('/:categoryId', authMiddleware, access(['admin']), categoryController.getCategory);

router.get('/:categoryId/products', authMiddleware, productController.getAllProductsByCategory);

/**
 * @route PUT /:categoryId
 * @description Updates an existing category.
 * @access Private (requires Firebase authentication)
 * @param {string} categoryId - The ID of the category to update.
 * @middleware validate(categoryValidationSchema): Validates category update request body.
 */
router.put(
  '/:categoryId',
  authMiddleware,
  access(['admin']),
  imageUpload('category').single('image'),
  validate(updateCategoryValidationSchema),
  categoryController.updateCatogory,
);

/**
 * @route DELETE /:categoryId
 * @description Deletes a category.
 * @access Private (requires Firebase authentication)
 * @param {string} categoryId - The ID of the category to delete.
 */
router.delete('/:categoryId', authMiddleware, access(['admin']), categoryController.deleteCategory);

// Export the router
module.exports = router;
