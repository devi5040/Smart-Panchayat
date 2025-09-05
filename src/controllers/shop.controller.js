/**
 * @filename shop.controller.js
 * @description This file handles all the HTTP requests related to shop management.  It acts as an intermediary between the client-side requests
 * and the shop service layer, managing the creation, retrieval, updating, and adding remarks to shops and their shipments.  Error handling is
 * implemented to provide informative responses to the client.
 *
 * @version v1.0.0
 * @updated Sep 01 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const shopServices = require('../services/shop.service');
const logger = require('../utils/logger');

/**
 * Adds a new shop.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {number} req.user.id - The ID of the user creating the shop.
 * @param {string} req.body.name - The name of the shop.
 * @param {number} req.body.pin_code - The pin code of the shop's location.
 * @param {number} req.body.latitude - The latitude of the shop's location.
 * @param {number} req.body.longitude - The longitude of the shop's location.
 * @async
 */
exports.addShop = async (req, res) => {
  const userId = req.user.id;
  const { name, pin_code, latitude, longitude } = req.body;
  try {
    /** @type {Object} shop - The newly created shop object from the service layer.*/
    const shop = await shopServices.addShop(name, pin_code, latitude, longitude, userId);
    res.status(201).json({ message: 'Shop has been created successfully! 🚀', shop });
  } catch (error) {
    logger.error(`Internal error while creating the shop: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: '⚠️ An internal error occurred while creating the shop. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Retrieves all shops.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @async
 */
exports.getShops = async (req, res) => {
  try {
    /** @type {Array<Object>} shops - An array of shop objects. */
    const shops = await shopServices.getShops();
    res.status(200).json({ message: '✅ Shops fetched successfully!', shops });
  } catch (error) {
    logger.error(`Internal error while fetching the shops: ${error}`);
    res.status(500).json({
      message: '⚠️ An internal error occurred while fetching the shops. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Retrieves details for a specific shop.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {number} req.params.shopId - The ID of the shop to retrieve.
 * @async
 */
exports.getShopDetails = async (req, res) => {
  const { shopId } = req.params;
  try {
    /** @type {Object} shop - The shop object corresponding to the provided shopId. */
    const shop = await shopServices.getShopDetails(shopId);
    res.status(200).json({ message: '✅ Shop details fetched successfully!', shop });
  } catch (error) {
    logger.error(`Internal error while fetching shop details: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: '⚠️ An internal error occurred while fetching shop details. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Updates the details of a shop.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {number} req.params.shopId - The ID of the shop to update.
 * @param {number} req.user.id - The ID of the user updating the shop.
 * @param {string} req.body.name - The updated name of the shop.
 * @param {number} req.body.pinCode - The updated pin code of the shop's location.
 * @param {number} req.body.latitude - The updated latitude of the shop's location.
 * @param {number} req.body.longitude - The updated longitude of the shop's location.
 * @async
 */
exports.updateShopDetails = async (req, res) => {
  const { shopId } = req.params;
  const userId = req.user.id;
  const { name, pinCode, latitude, longitude } = req.body;
  try {
    /** @type {Object} shopDetails - The updated shop object. */
    const shopDetails = await shopServices.updateShopDetails(
      userId,
      shopId,
      name,
      pinCode,
      latitude,
      longitude,
    );
    res.status(200).json({ message: '✅ Shop details updated successfully!', shopDetails });
  } catch (error) {
    logger.error(`Internal error while updating the shop: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: '⚠️ An internal error occurred while updating the shop. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Adds remarks to a shipment.  This seems out of place in a shop controller. Consider refactoring.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {number} req.params.shipmentId - The ID of the shipment to add remarks to.
 * @param {string} req.body.remarks - The remarks to add.
 * @async
 */
exports.addRemarks = async (req, res) => {
  const { shipmentId } = req.params;
  const { remarks, shopId } = req.body;
  try {
    /** @type {Object} shipment - The updated shipment object including remarks. */
    const shipment = await shopServices.addRemarksToShipments(shopId, shipmentId, remarks);
    res.status(200).json({
      message: '✅ Remarks added to the shipment successfully!',
      shipment,
    });
  } catch (error) {
    logger.error(`Internal error while updating the shipment remarks: ${error}`);
    const status = error.statusCode;
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while updating the shipment remarks. Please try again later.',
      error: error.message,
    });
  }
};
