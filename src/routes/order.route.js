/**
 * @filename order.route.js
 * @description This file defines all the API routes for managing orders.  It uses Express.js to handle various HTTP requests related to order
 * retrieval, creation, and updating.  Routes are secured using middleware for authentication and input validation, ensuring data integrity and
 * access control.
 *
 * @version v1.0.0
 * @updated August 29, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const express = require('express');
const router = express.Router(); // Use express.Router() for better organization

const auth = require('../middleware/firebaseAuthMiddleware');
const access = require('../middleware/authorization.middleware');
/**
 * @type {import('express').Router}
 * @description Express Router instance for handling order-related routes.
 */

/**
 * @description Middleware for validating incoming requests based on defined schemas.
 * @type {import('express').RequestHandler}
 */
const validate = require('../middleware/validation.middleware');

/**
 * @description Order validation schemas.  These define the expected structure of requests.
 * @type {object}
 */
const orderSchema = require('../utils/validation/order.validation');

/**
 * @description Controller functions for handling order-related operations.
 * @type {object}
 */
const orderController = require('../controllers/order.controller');

/**
 * @route GET /
 * @description Retrieves a list of orders.  Note:  This may be subject to pagination or filtering in a production environment.
 * @returns {Promise<Array<Object>>} An array of order objects, or an empty array if no orders are found.  The structure of the order objects is defined in the `order.controller.getOrders` function.  Error handling should be implemented in the controller to return appropriate error responses for database or other issues.
 */
router.get('/', auth, access(['admin', 'agent']), orderController.getOrders);

/**
 * @route GET /history
 * @description Retrieves the order history for an authenticated user.  Requires Firebase authentication.
 * @param {import('express').Request} req - Express request object.  Should contain user authentication information from the `auth` middleware.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Array<Object>>} An array of order history objects, or an empty array if no order history is found for the user.  Error handling is implemented in the controller.
 */
router.get('/history', auth, orderController.getOrderHistory);

/**
 * @route GET /:orderId
 * @description Retrieves a single order by its ID.
 * @param {import('express').Request} req - Express request object.  The `orderId` parameter is expected in the request parameters.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Object|null>} A single order object if found, or null if not found. Error handling is implemented in the controller.
 */
router.get('/:orderId', auth, access(['admin', 'agent']), orderController.getOrderByID);

/**
 * @route GET /collection-centre/:collectionCentre
 * @description Retrieves orders associated with a specific collection centre.
 * @param {import('express').Request} req - Express request object. The `collectionCentre` parameter is expected in the request parameters.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Array<Object>>} An array of order objects associated with the specified collection centre.  Returns an empty array if no orders are found. Error handling is implemented in the controller.
 */
router.get(
  '/collection-centre/:collectionCentre',
  auth,
  access(['admin', 'agent']),
  orderController.getOrdersByCollectionCentre,
);

/**
 * @route GET /payment-status/:paymentStatus
 * @description Retrieves orders based on their payment status.  Input validation is performed using the `orderSchema.paymentStatusOrderSchema`.
 * @param {import('express').Request} req - Express request object.  The `paymentStatus` parameter is expected and validated in the request parameters.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Array<Object>>} An array of order objects matching the specified payment status. Returns an empty array if no orders are found. Error handling is implemented in the controller.
 */
router.get(
  '/payment-status/:paymentStatus',
  validate(orderSchema.paymentStatusOrderSchema, 'params'),
  auth,
  access(['admin']),
  orderController.getOrdersByPaymentStatus,
);

/**
 * @route POST /
 * @description Adds a new order. Input validation is performed using the `orderSchema.orderSchema`.
 * @param {import('express').Request} req - Express request object.  The order data is expected in the request body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Object>} The newly created order object. Error handling (e.g., database errors, validation errors) is implemented in the controller.
 */
router.post(
  '/',
  validate(orderSchema.orderSchema),
  auth,
  access(['admin', 'agent']),
  orderController.addOrder,
);

/**
 * @route PATCH /:orderId
 * @description Updates the payment status of an order. Input validation is performed using the `orderSchema.paymentStatusOrderSchema`.
 * @param {import('express').Request} req - Express request object.  The `orderId` parameter is expected, and the updated payment status is expected in the request body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Object>} The updated order object. Error handling is implemented in the controller.
 */
router.patch(
  '/:orderId',
  validate(orderSchema.paymentStatusOrderSchema),
  auth,
  access(['admin', 'agent']),
  orderController.updateOrderPaymentStatus,
);

/**
 * @description Exports the Express router instance.
 * @type {import('express').Router}
 */
module.exports = router;
