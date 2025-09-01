/**
 * @filename shop.service.js
 * @description This service file provides functionalities for managing shops and their associated shipments.  It handles creating, retrieving,
 * updating shop details, and adding remarks to shipments.  The service interacts with database models for Shops and ShipmentShops to perform these
 * operations, implementing robust error handling for various scenarios, including invalid IDs, non-existent records, and conflicts.
 *
 * @version v1.0.0
 * @updated September 1, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const { Shops, Users, ShipmentShops } = require("../models");
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require("../utils/error");

/**
 * Retrieves a shop's ID based on the provided user ID.
 * @async
 * @param {number} userId - The ID of the user.
 * @throws {Error} If the user ID is invalid or the user or shop is not found.  Throws NotFoundError if user or shop is not found.
 * @returns {Promise<object>} - A promise that resolves to the Sequelize Shop instance if found, otherwise rejects.
 */
exports.getShopIdbyUserId = async (userId) => {
  if (!userId || isNaN(userId)) throw new Error("User id is invalid");
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError("User not found.");
  const shop = await Shops.findOne({ where: { userId } });
  if (!shop) throw new NotFoundError("Shop does not found"); // Changed to NotFoundError for consistency
  return shop;
};

/**
 * Adds a new shop for a given user.
 * @async
 * @param {string} name - The name of the shop.
 * @param {string} pinCode - The pin code of the shop's location.
 * @param {number} latitude - The latitude of the shop's location.
 * @param {number} longitude - The longitude of the shop's location.
 * @param {number} userId - The ID of the user who owns the shop.
 * @throws {ConflictError} If a shop already exists for the user.
 * @returns {Promise<object>} A promise that resolves to the newly created Sequelize Shop instance.
 */
exports.addShop = async (name, pinCode, latitude, longitude, userId) => {
  const shop = await Shops.findAll({ where: { userId } });
  if (shop && shop.length > 0)
    throw new ConflictError("Shop already exists for the user");
  const newShop = await Shops.create({
    shop_name: name,
    pin_code: pinCode,
    latitude,
    longitude,
    userId,
  });
  return newShop;
};

/**
 * Retrieves all shops.
 * @async
 * @returns {Promise<object[]>} A promise that resolves to an array of Sequelize Shop instances.
 */
exports.getShops = async () => {
  const shops = await Shops.findAll();
  return shops;
};

/**
 * Retrieves details for a specific shop.
 * @async
 * @param {number} shopId - The ID of the shop.
 * @throws {BadRequestError} If the shop ID is invalid.
 * @throws {NotFoundError} If the shop is not found.
 * @returns {Promise<object>} A promise that resolves to the Sequelize Shop instance if found, otherwise rejects.
 */
exports.getShopDetails = async (shopId) => {
  if (!shopId || isNaN(shopId)) throw new BadRequestError("Invalid shop id");
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError("Shop not found");
  return shop;
};

/**
 * Updates the details of a specific shop.
 * @async
 * @param {number} userId - The ID of the user who owns the shop.
 * @param {number} shopId - The ID of the shop to update.
 * @param {string} name - The new name of the shop.
 * @param {string} pinCode - The new pin code of the shop's location.
 * @param {number} latitude - The new latitude of the shop's location.
 * @param {number} longitude - The new longitude of the shop's location.
 * @throws {NotFoundError} If the shop is not found.
 * @throws {Error} If the shop cannot be updated.
 * @returns {Promise<object>} A promise that resolves to the updated Sequelize Shop instance.
 */
exports.updateShopDetails = async (
  userId,
  shopId,
  name,
  pinCode,
  latitude,
  longitude
) => {
  const shop = await Shops.findOne({ where: { userId, id: shopId } });
  if (!shop) throw new NotFoundError("Shop not found");
  const [numRowsUpdated] = await Shops.update(
    {
      shop_name: name,
      pin_code: pinCode,
      latitude,
      longitude,
    },
    { where: { userId, id: shopId } }
  );
  if (numRowsUpdated == 0) throw new Error("Shop cannot be updated");
  const updatedShop = await Shops.findOne({ where: { id: shopId, userId } });
  if (!updatedShop) throw new NotFoundError("Shop not found for this user");
  return updatedShop;
};

/**
 * Adds remarks to a shipment.
 * @async
 * @param {number} shipmentId - The ID of the shipment.
 * @param {string} remarks - The remarks to add.
 * @throws {Error} If the shipment ID is invalid.
 * @throws {NotFoundError} If the shipment is not found.
 * @throws {Error} if no records are updated.
 * @returns {Promise<object>} A promise that resolves to the updated Sequelize ShipmentShops instance.
 */
exports.addRemarksToShipments = async (shipmentId, remarks) => {
  if (!shipmentId) throw new Error("shipment id is invalid");
  const shipment = await ShipmentShops.findByPk(shipmentId);
  if (!shipment) throw new NotFoundError("Shipment not found");
  const [numRowsUpdated] = await ShipmentShops.update(
    { remarks },
    { where: { id: shipmentId } }
  );
  if (numRowsUpdated == 0) throw new Error("No records are updated.");
  const shipmentData = await ShipmentShops.findByPk(shipmentId);
  return shipmentData;
};
