/**
 * @filename shipment.route.js
 * @description This file defines all the API routes for managing shipments.  It uses Express.js routing to handle various HTTP requests related
 * to creating, retrieving, updating, and deleting shipments, including managing associated shops and products.  Input validation is implemented
 * using middleware before processing requests.
 *
 * @version v1.0.0
 * @updated September 3, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const router = require('express').Router();

const auth = require('../middleware/firebaseAuthMiddleware');
const access = require('../middleware/authorization.middleware');

// Import middleware and schemas for validation.
const validate = require('../middleware/validation.middleware');
const schema = require('../utils/validation/shipment.validation');

// Import shipment controller functions.
const shipmentController = require('../controllers/shipment.controller');

router.get('/admin', auth, access(['admin']), shipmentController.fetchShipmentsForAdmin);

/**
 * @route GET /
 * @description Retrieves a list of shipments.
 * @returns {Array<Object>} An array of shipment objects.  Each object represents a shipment and should contain relevant fields as defined in the database model.  See Sequelize documentation for details on retrieving data.
 * @throws {Error} An error if the request fails.  Error handling should be implemented within the controller.
 */
router.get('/', auth, access(['agent', 'admin']), shipmentController.getShipmentList);

/**
 * @route POST /
 * @description Creates a new shipment.
 * @param {Object} req.body - The request body containing shipment data.  Should conform to the schema defined in `shipment.validation.shipmentSchema`.
 * @returns {Object} The newly created shipment object.
 * @throws {Error} 400 Bad Request - If input validation fails.  Error details should be provided in the response.  See Sequelize documentation for details on creating data.
 */
router.post(
  '/',
  validate(schema.shipmentSchema),
  auth,
  access(['admin', 'agent']),
  shipmentController.createShipment,
);

/**
 * @route PATCH /:shipmentId
 * @description Updates the products associated with a shipment.
 * @param {string} req.params.shipmentId - The ID of the shipment to update.
 * @param {Object} req.body - The request body containing the updated product information. Should conform to the schema defined in `shipment.validation.shipmentProductUpdateSchema`.
 * @returns {Object} The updated shipment object.
 * @throws {Error} 400 Bad Request - If input validation fails. 404 Not Found - If the shipment is not found.  See Sequelize documentation for details on updating data.
 */
router.patch(
  '/:shipmentId',
  validate(schema.shipmentProductUpdateSchema),
  auth,
  access(['admin', 'agent']),
  shipmentController.updateShipmentProduct,
);

router.patch(
  '/:shipmentId/status',
  validate(schema.shipmentStatus),
  auth,
  access(['admin', 'agent']),
  shipmentController.updateShipmentStatus,
);

/**
 * @route PUT /
 * @description Adds a shop to an existing shipment.
 * @param {Object} req.body - The request body containing the shop ID to add. Should conform to the schema defined in `shipment.validation.addShopToShipmentSchema`.
 * @returns {Object} The updated shipment object.
 * @throws {Error} 400 Bad Request - If input validation fails.  See Sequelize documentation for details on updating data.
 */
router.put(
  '/',
  validate(schema.addShopToShipmentSchema),
  auth,
  access(['admin', 'agent']),
  shipmentController.addShopToShipment,
);

/**
 * @route GET /shop/:shopId
 * @description Retrieves shipments associated with a specific shop.
 * @param {string} req.params.shopId - The ID of the shop.
 * @returns {Array<Object>} An array of shipment objects associated with the shop.
 * @throws {Error} 404 Not Found - If no shipments are found for the given shop ID.
 */
router.get('/shop', auth, access(['admin', 'shop']), shipmentController.getShipmentForShops);

/**
 * @route GET /status/:status
 * @description Retrieves shipments with a specific status.
 * @param {string} req.params.status - The shipment status.  Should conform to the schema defined in `shipment.validation.shipmentStatus`.
 * @returns {Array<Object>} An array of shipment objects matching the specified status.
 * @throws {Error} 400 Bad Request - If input validation fails. 404 Not Found - If no shipments are found for the given status.
 */
router.get(
  '/status/:status',
  validate(schema.shipmentStatus, 'params'),
  auth,
  access(['admin', 'agent']),
  shipmentController.getShipmentByStatus,
);

/**
 * @route GET /mode/:mode
 * @description Retrieves shipments using a specific transportation mode.
 * @param {string} req.params.mode - The transportation mode. Should conform to the schema defined in `shipment.validation.shipmentModeSchema`.
 * @returns {Array<Object>} An array of shipment objects using the specified transportation mode.
 * @throws {Error} 400 Bad Request - If input validation fails. 404 Not Found - If no shipments are found for the given mode.
 */
router.get(
  '/mode/:mode',
  validate(schema.shipmentModeSchema, 'params'),
  auth,
  access(['admin']),
  shipmentController.getShipmentByTransportationMode,
);

router.get(
  '/collection-centre',
  auth,
  access(['admin', 'agent']),
  shipmentController.getShipmentsForCollectionCentre,
);

router.get('/:shipmentId', auth, access(['admin', 'shop']), shipmentController.getShipmentDetails);

/**
 * @route DELETE /:shipmentId/shop/:shopId/product/:productId
 * @description Removes a product from a shipment for a specific shop.
 * @param {string} req.params.shipmentId - The ID of the shipment.
 * @param {string} req.params.shopId - The ID of the shop.
 * @param {string} req.params.productId - The ID of the product.
 * @returns {Object} A success message or status indicating successful deletion.
 * @throws {Error} 404 Not Found - If the shipment, shop, or product is not found. See Sequelize documentation for details on deleting data.
 */
router.delete(
  '/:shipmentId/shop/:shopId/product/:productId',
  auth,
  access(['admin']),
  shipmentController.removeShipmentProduct,
);

/**
 * @route DELETE /:shipmentId/shop/:shopId
 * @description Removes a shop from a shipment.
 * @param {string} req.params.shipmentId - The ID of the shipment.
 * @param {string} req.params.shopId - The ID of the shop.
 * @returns {Object} A success message or status indicating successful deletion.
 * @throws {Error} 404 Not Found - If the shipment or shop is not found. See Sequelize documentation for details on deleting data.
 */
router.delete(
  '/:shipmentId/shop/:shopId',
  auth,
  access(['admin']),
  shipmentController.removeShipmentShop,
);

module.exports = router;
