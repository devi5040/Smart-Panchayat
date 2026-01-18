/**
 * @filename product.routes.js
 * @description This file defines all the API routes for managing products. It uses Express.js routing to handle various HTTP requests related to
 * product creation, retrieval, updating, and deletion.  Authentication and authorization middleware are used to protect these routes, ensuring
 * only authenticated and authorized users can access specific functionalities.  Input validation middleware is implemented to ensure data
 * integrity.
 *
 * @version v1.0.0
 * @updated August 26, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const router = require('express').Router();

const imageUpload = require('../middleware/image-upload.middleware');

/**
 * @description Middleware for Firebase authentication.  Verifies user authentication.
 * @type {function}
 */
const authentication = require('../middleware/firebaseAuthMiddleware');

/**
 * @description Middleware for authorization. Checks if the user has the required roles.
 * @type {function}
 */
const authorization = require('../middleware/authorization.middleware');

/**
 * @description Middleware for validating request data.
 * @type {function}
 */
const validate = require('../middleware/validation.middleware');

/**
 * @description Validation schema for product data.
 * @type {object}
 */
const productValidator = require('../utils/validation/product.validation');

/**
 * @description Controller for product-related operations.
 * @type {object}
 */
const productController = require('../controllers/product.controller');
const { fileUploadSchema } = require('../utils/validation/fileUploadValidation');

/**
 * @swagger
 * /shop:
 *   get:
 *     summary: Get products for shops.
 *     tags: [Product]
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: A list of products.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/shop', authentication, authorization(['shop']), productController.getProductForShops);

/**
 * @swagger
 * /shop/{status}:
 *   get:
 *     summary: Get products for a specific status.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: The status of the products to retrieve.
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: A list of products with the specified status.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  '/shop/:status',
  authentication,
  authorization(['shop', 'admin']),
  productController.getProductForStatus,
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all products.
 *     tags: [Product]
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: A list of all products.
 *       '401':
 *         description: Unauthorized
 */
router.get('/', authentication, productController.getAllProducts);

router.get('/verified', authentication, productController.getVerifiedProducts);

router.get('/recent', authentication, productController.getRecentProducts);

router.get('/search', authentication, productController.searchProducts);

router.patch(
  '/verified/:productId',
  authentication,
  authorization(['admin']),
  productController.verifyProduct,
);

/**
 * @swagger
 * /{productId}:
 *   get:
 *     summary: Get product details by ID.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to retrieve.
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: Product details.
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 */
router.get('/:productId', authentication, productController.getProductDetails);

router.post(
  '/signed-url',
  authentication,
  authorization(['admin', 'shop']),
  validate(fileUploadSchema),
  productController.getSignedUrl,
);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Add a new product.
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     security:
 *       - Firebase: []
 *     responses:
 *       '201':
 *         description: Product created successfully.
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 */
router.post(
  '/shop',
  authentication,
  authorization(['shop']),
  validate(productValidator.productShopSchema),
  productController.addShopProduct,
);

router.post(
  '/',
  authentication,
  authorization(['admin', 'shop']),
  imageUpload('product').single('image'),
  validate(productValidator.productValidation),
  productController.addProduct,
);

router.patch(
  '/shop/:productId',
  authentication,
  authorization(['admin']),
  productController.updateProductPrice,
);

router.put(
  '/shop/:shopProductId',
  authentication,
  authorization(['shop']),
  validate(productValidator.updateProductShopSchema),
  productController.updateShopProduct,
);
/**
 * @swagger
 * /{shopProductId}/status:
 *   patch:
 *     summary: Update product status.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: shopProductId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductStatusUpdate'
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: Product status updated successfully.
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 */
router.patch(
  '/:shopProductId/status',
  authentication,
  authorization(['admin']),
  validate(productValidator.statusValidation),
  productController.updateProductStatus,
);

/**
 * @swagger
 * /{productId}:
 *   put:
 *     summary: Update a product.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: Product updated successfully.
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 */
router.put(
  '/:productId',
  authentication,
  authorization(['admin']),
  imageUpload('product').single('image'),
  validate(productValidator.updateProductValidation),
  productController.updateProduct,
);

/**
 * @swagger
 * /{productId}:
 *   delete:
 *     summary: Delete a product.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to delete.
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: Product deleted successfully.
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 */
router.delete(
  '/:productId',
  authentication,
  authorization(['admin']),
  productController.deleteProduct,
);

module.exports = router;
