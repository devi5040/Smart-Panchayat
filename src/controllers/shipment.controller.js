/**
 * @filename shipment.controller.js
 * @description This file defines the controller functions for managing shipments.  It handles requests related to creating, retrieving, updating,
 * and deleting shipment information, including adding and removing shops and products from shipments.  The controller interacts with the
 * `shipment.service` for data access and uses a logger for error handling.
 *
 * @version v1.0.0
 * @updated September 3, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const shipmentServices = require('../services/shipment.service');
const logger = require('../utils/logger');

/**
 * @description - Gets a list of all shipments.
 * @async
 * @function getShipmentList
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue fetching shipments.  The error message will be included in the response.
 */
exports.getShipmentList = async (req, res) => {
  try {
    const shipments = await shipmentServices.getShipmentList();
    res.status(200).json({ message: '✅ Shipments fetched successfully!', shipments });
  } catch (error) {
    logger.error(`Internal error while fetching shipments: ${error}`);
    res.status(500).json({
      message: '⚠️ An internal error occurred while fetching shipments. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Creates a new shipment.
 * @async
 * @function createShipment
 * @param {object} req - Express request object.  The body should contain `shipmentDetails` and `shops`.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue creating the shipment. The error status code and message will be included in the response.
 */
exports.createShipment = async (req, res) => {
  const { shipmentDetails, shops } = req.body;
  try {
    const shipment = await shipmentServices.createShipment(shipmentDetails, shops);
    res.status(201).json({ message: '✅ Shipment created successfully!', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while creating the shipment: ${error}`);
    res.status(status).json({
      message: '⚠️ An internal error occurred while creating the shipment. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Adds a shop and its products to an existing shipment.
 * @async
 * @function addShopToShipment
 * @param {object} req - Express request object. The body should contain `shipmentId`, `shopId`, and `products`.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue adding the shop to the shipment. The error status code and message will be included in the response.
 */
exports.addShopToShipment = async (req, res) => {
  const { shipmentId, shopId, products } = req.body;
  try {
    const shipment = await shipmentServices.addShopsToShipments(shipmentId, shopId, products);
    res.status(201).json({
      message: 'Shop and products added to the shipment successfully.',
      shipment,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating the shipment with shop and product: ${error}`);
    res.status(status).json({
      message: '⚠️ An internal error occurred while creating the shipment. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Gets a shipment for a specific shop.
 * @async
 * @function getShipmentForShops
 * @param {object} req - Express request object.  The `shopId` is expected in the request parameters.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue fetching the shipment. The error status code and message will be included in the response.
 */
exports.getShipmentForShops = async (req, res) => {
  const { shopId } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentForShop(shopId);
    res.status(200).json({ message: 'Shipment fetched successfully!', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching the shipment data for shops: ${shopId}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Gets shipments by status.
 * @async
 * @function getShipmentByStatus
 * @param {object} req - Express request object. The `status` is expected in the request parameters.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue fetching shipments by status. The error status code and message will be included in the response.
 */
exports.getShipmentByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentsByStatus(status);
    res.status(200).json({ message: 'Shipment fetched successfully!', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching shipment by status: ${status}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Gets shipments by transportation mode.
 * @async
 * @function getShipmentByTransportationMode
 * @param {object} req - Express request object. The `mode` is expected in the request parameters.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue fetching shipments by transportation mode. The error message will be included in the response.
 */
exports.getShipmentByTransportationMode = async (req, res) => {
  const { mode } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentsByMode(mode);
    res.status(200).json({ message: 'Shipment fetched successfully!', shipment });
  } catch (error) {
    logger.error(`Internal error while fetching the shipment by transportation mode: ${error}`);
    res.status(500).json({
      message:
        '⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Updates the quantity of a product in a shipment.
 * @async
 * @function updateShipmentProduct
 * @param {object} req - Express request object. The `shipmentId` is expected in the request parameters, and `shopId`, `productId`, and `quantity` in the request body.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue updating the product quantity. The error status code and message will be included in the response.
 */
exports.updateShipmentProduct = async (req, res) => {
  const { shipmentId } = req.params;
  const { shopId, productId, quantity } = req.body;
  try {
    const shipment = await shipmentServices.updateShipmentProduct(
      shipmentId,
      shopId,
      productId,
      quantity,
    );
    res.status(200).json({ message: 'Product data updated successfully', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating the shipment products: ${error}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while updating the shipment data for products. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @description - Removes a product from a shipment.
 * @async
 * @function removeShipmentProduct
 * @param {object} req - Express request object. `shipmentId`, `shopId`, and `productId` are expected in the request parameters.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue removing the product. The error status code and message will be included in the response.
 */
exports.removeShipmentProduct = async (req, res) => {
  const { shipmentId, shopId, productId } = req.params;
  try {
    const shipment = await shipmentServices.removeProductFromShipment(
      shipmentId,
      shopId,
      productId,
    );
    res.status(200).json({ message: 'Shipment fetched successfully!', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while removing shipment product: ${error}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while removing the shipment product. Please try again later!',
      error: error.message,
    });
  }
};

/**
 * @description - Removes a shop from a shipment.
 * @async
 * @function removeShipmentShop
 * @param {object} req - Express request object. `shipmentId` and `shopId` are expected in the request parameters.
 * @param {object} res - Express response object.
 * @throws {Error} - Throws an error if there is an issue removing the shop. The error status code and message will be included in the response.
 */
exports.removeShipmentShop = async (req, res) => {
  const { shipmentId, shopId } = req.params;
  try {
    const shipment = await shipmentServices.removeShopFromShipment(shipmentId, shopId);
    res.status(200).json({ message: 'Shipment data fetched successfully!', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while removing the shop details:${error}`);
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while removing the shop details. Please try again later.',
      error: error.message,
    });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  const { shipmentId } = req.params;
  const { shopId, status } = req.body;
  try {
    const shipment = await shipmentServices.updateShipmentStatus(shipmentId, shopId, status);
    res.status(200).json({ message: 'Status updated successfully.', shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error wile updating the status: ${error}`);
    res
      .status(status)
      .json({ message: 'Internal error while updating the shipment status', error: error.message });
  }
};
