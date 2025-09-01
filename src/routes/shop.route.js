/**
 * @filename shop.route.js
 * @description This file defines all the API routes for managing shops. It uses Express.js router to handle GET, POST, PUT, and PATCH requests related to shops and
 * their details, including adding shops, fetching shop details, updating shop information, and adding shipment remarks.  Authentication and data validation middleware
 * are implemented for security and data integrity.
 *
 * @version v1.0.0
 * @updated September 1, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const express = require("express");
const router = express.Router(); // Use express.Router() for better readability

const auth = require("../middleware/firebaseAuthMiddleware");
/**
 * @type {import('express').RequestHandler}
 * @description Middleware for Firebase authentication.  Ensures requests are authenticated.
 */

const validation = require("../middleware/validation.middleware");
/**
 * @type {import('express').RequestHandler}
 * @param {object} schema - Joi validation schema.
 * @description Middleware for validating request data against a Joi schema.
 */

const shopController = require("../controllers/shop.controller");
/**
 * @description Controller for shop-related actions.
 */

const shopValidator = require("../utils/validation/shop.validation");
/**
 * @description Contains Joi validation schemas for shop data.
 */

/**
 * @route GET /
 * @description Retrieves a list of shops.  Requires authentication.
 * @middleware {auth} Firebase Authentication middleware
 * @middleware {shopController.getShops} Shop controller method to handle the request.
 */
router.get("/", auth, shopController.getShops);

/**
 * @route GET /:shopId
 * @description Retrieves details for a specific shop.
 * @param {string} shopId - The ID of the shop to retrieve.
 * @middleware {shopController.getShopDetails} Shop controller method to handle the request.
 */
router.get("/:shopId", shopController.getShopDetails);

/**
 * @route POST /
 * @description Adds a new shop. Requires authentication and input validation.
 * @middleware {auth} Firebase Authentication middleware
 * @middleware {validation(shopValidator.productDataSchema)} Input validation middleware using Joi schema.
 * @middleware {shopController.addShop} Shop controller method to handle the request.
 */
router.post(
  "/",
  auth,
  validation(shopValidator.productDataSchema),
  shopController.addShop
);

/**
 * @route PUT /:shopId
 * @description Updates details for a specific shop. Requires authentication and input validation.
 * @param {string} shopId - The ID of the shop to update.
 * @middleware {auth} Firebase Authentication middleware
 * @middleware {validation(shopValidator.productDataSchema)} Input validation middleware using Joi schema.
 * @middleware {shopController.updateShopDetails} Shop controller method to handle the request.
 */
router.put(
  "/:shopId",
  auth,
  validation(shopValidator.productDataSchema),
  shopController.updateShopDetails
);

/**
 * @route PATCH /shipment/:shipmentId
 * @description Adds remarks to a specific shipment. Requires input validation.
 * @param {string} shipmentId - The ID of the shipment.
 * @middleware {validation(shopValidator.remarksSchema)} Input validation middleware using Joi schema.
 * @middleware {shopController.addRemarks} Shop controller method to handle the request.
 */
router.patch(
  "/shipment/:shipmentId",
  validation(shopValidator.remarksSchema),
  shopController.addRemarks
);

module.exports = router;
