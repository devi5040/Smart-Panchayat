/**
 * @filename agent.services.js
 * @description This file provides backend services for managing agents within the application.  It handles the creation of new agent accounts,
 * deletion of existing agent accounts, and the modification of user roles to assign agent status.  The services interact with a user database
 * model to perform these operations and leverage custom error handling for various scenarios, including conflicts, missing users, and update
 * failures.
 *
 * @version v1.0.0
 * @updated Sep 4, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const { Op } = require('sequelize');
const { Users, Products, Orders, Shipments, ShipmentShops, Notifications } = require('../models');
const { ConflictError, NotFoundError, NoContentError } = require('../utils/error');
const { calculatePercentage } = require('../utils/calculatePercentage');

/**
 * Adds a new agent to the database.
 * @async
 * @param {string} mobileNumber - The agent's mobile number.
 * @param {string} name - The agent's name.
 * @param {number} latitude - The agent's latitude.
 * @param {number} longitude - The agent's longitude.
 * @param {string} languagePreference - The agent's preferred language.
 * @throws {ConflictError} If a user with the same mobile number already exists.
 * @throws {Error} If the user creation fails.
 * @returns {Promise<object>} The newly created agent object.  Returns the Sequelize instance of the created User.
 */
exports.addAgent = async (
  mobileNumber,
  name,
  latitude,
  longitude,
  languagePreference,
  collectionCentreId,
) => {
  const userExist = await Users.findOne({
    where: { phone_number: mobileNumber },
  });
  if (userExist) throw new ConflictError('User already exists');
  const user = await Users.create({
    phone_number: mobileNumber,
    user_name_en: name,
    user_name_kn: name,
    latitude,
    longitude,
    language_preference: languagePreference,
    user_role: 'agent',
    collectionCentreId,
  });
  if (!user) throw new Error('User not created');
  return user;
};

/**
 * Removes an agent from the database.
 * @async
 * @param {number} agentId - The ID of the agent to remove.
 * @throws {NotFoundError} If the agent is not found or if the deletion fails.
 * @throws {Error} If the user to be deleted is not an agent.
 * @returns {Promise<boolean>} True if the agent was successfully removed, otherwise throws an error.
 */
exports.removeAgent = async (agentId) => {
  const user = await Users.findByPk(agentId);
  if (!user) throw new NotFoundError('User not found!');
  if (user.user_role !== 'agent') throw new Error('Given user is not an agent!');
  const numRowsDeleted = await Users.destroy({ where: { id: agentId } });
  if (numRowsDeleted === 0) throw new NotFoundError('Agent is not deleted!');
  return true;
};

/**
 * Changes a user's role to "agent".
 * @async
 * @param {number} userId - The ID of the user to change.
 * @throws {NotFoundError} If the user is not found.
 * @throws {NoContentError} If no rows were updated.
 * @returns {Promise<object>} The updated user object with specific attributes. Returns the Sequelize instance of the updated User.
 */
exports.changeToAgent = async (userId, collectionCentreId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const [numRowsUpdated] = await Users.update(
    { user_role: 'agent', collectionCentreId },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findByPk(userId, {
    attributes: [
      'id',
      'user_name_en',
      'user_name_kn',
      'phone_number',
      'user_role',
      'language_preference',
    ],
  });
  return data;
};

exports.fetchDashboardItems = async () => {
  const todayDate = () => {
    return new Date();
  };
  const today = todayDate();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  let value, isPositive, percentage, yesterdayValue;
  // Total users
  const [totalUsers, todayUsers, yesterdayUsers] = await Promise.all([
    Users.count(),
    Users.count({
      where: { createdAt: { [Op.gte]: today } },
    }),
    Users.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
    }),
  ]);

  percentage = calculatePercentage(todayUsers, yesterdayUsers);
  isPositive = todayUsers >= yesterdayUsers;
  const total_users = { value: totalUsers, isPositive, percentage };

  // Total Farmers
  const [totalFarmers, todayFarmers, yesterdayFarmers] = await Promise.all([
    Users.count({ where: { user_role: 'user' } }),
    Users.count({
      where: { createdAt: { [Op.gte]: today }, user_role: 'user' },
    }),
    Users.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
        user_role: 'user',
      },
    }),
  ]);
  percentage = calculatePercentage(todayFarmers, yesterdayFarmers);
  isPositive = todayFarmers >= yesterdayFarmers;
  const total_farmers = { value: totalFarmers, isPositive, percentage };

  // Total Shops
  const [totalShops, todayShops, yesterdayShops] = await Promise.all([
    Users.count({ where: { user_role: 'shop' } }),
    Users.count({
      where: { createdAt: { [Op.gte]: today }, user_role: 'shop' },
    }),
    Users.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
        user_role: 'shop',
      },
    }),
  ]);
  percentage = calculatePercentage(todayShops, yesterdayShops);
  isPositive = todayShops >= yesterdayShops;
  const total_shops = { value: totalShops, isPositive, percentage };

  // Total Products
  const [totalProducts, todayProducts, yesterdayProducts] = await Promise.all([
    Products.count(),
    Products.count({
      where: { createdAt: { [Op.gte]: today } },
    }),
    Products.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
    }),
  ]);
  percentage = calculatePercentage(todayProducts, yesterdayProducts);
  isPositive = todayProducts >= yesterdayProducts;
  const total_products = { value: totalProducts, isPositive, percentage };

  //App pending products
  const [pendingProducts, todayPendingProducts, yesterdayPendingProducts] = await Promise.all([
    Products.count({ where: { isVerified: false } }),
    Products.count({
      where: { createdAt: { [Op.gte]: today }, isVerified: false },
    }),
    Products.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
        isVerified: false,
      },
    }),
  ]);
  percentage = calculatePercentage(todayPendingProducts, yesterdayPendingProducts);
  isPositive = todayPendingProducts >= yesterdayPendingProducts;
  const pending_products = { value: pendingProducts, isPositive, percentage };

  //Orders Today
  const [ordersToday, ordersYesterday] = await Promise.all([
    Orders.count({ where: { createdAt: { [Op.gte]: today } } }),
    Orders.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
    }),
  ]);
  percentage = calculatePercentage(ordersToday, ordersYesterday);
  isPositive = ordersToday >= ordersYesterday;
  const orders_today = { value: ordersToday, isPositive, percentage };

  // Active shipments
  const [todayActiveShipments, yesterdayActiveShipments] = await Promise.all([
    Shipments.count({ include: { model: ShipmentShops, where: { status: 'pending' } } }),
    Shipments.count({
      where: { createdAt: { [Op.gte]: today } },
      include: { model: ShipmentShops, where: { status: 'pending' } },
    }),
    Shipments.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
      include: { model: ShipmentShops, where: { status: 'pending' } },
    }),
  ]);
  percentage = calculatePercentage(todayActiveShipments, yesterdayActiveShipments);
  isPositive = todayActiveShipments >= yesterdayActiveShipments;
  const active_shipments = { value: todayActiveShipments, isPositive, percentage };

  // Delivered shipments
  const [deliveredShipments, todayDeliveredShipments, yesterdayDeliveredShipments] =
    await Promise.all([
      Shipments.count({ include: { model: ShipmentShops, where: { status: 'delivered' } } }),
      Shipments.count({
        where: { createdAt: { [Op.gte]: today } },
        include: { model: ShipmentShops, where: { status: 'delivered' } },
      }),
      Shipments.count({
        where: {
          createdAt: {
            [Op.gte]: yesterday,
            [Op.lt]: today,
          },
        },
        include: { model: ShipmentShops, where: { status: 'delivered' } },
      }),
    ]);
  percentage = calculatePercentage(todayDeliveredShipments, yesterdayDeliveredShipments);
  isPositive = todayDeliveredShipments >= yesterdayDeliveredShipments;
  const delivered_shipments = { value: deliveredShipments, isPositive, percentage };

  // Pending shipments
  const [penidngShipments, todayPendingShipments, yesterdayPendingShipments] = await Promise.all([
    Shipments.count({ include: { model: ShipmentShops, where: { status: 'pending' } } }),
    Shipments.count({
      where: { createdAt: { [Op.gte]: today } },
      include: { model: ShipmentShops, where: { status: 'pending' } },
    }),
    Shipments.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
      include: { model: ShipmentShops, where: { status: 'pending' } },
    }),
  ]);
  percentage = calculatePercentage(todayPendingShipments, yesterdayPendingShipments);
  isPositive = todayPendingShipments >= yesterdayPendingShipments;
  const pending_shipments = { value: penidngShipments, isPositive, percentage };

  // Notifications Count
  const [notifications, todayNotifications, yesterdayNotifications] = await Promise.all([
    Notifications.count(),
    Notifications.count({ where: { createdAt: { [Op.gte]: today } } }),
    Notifications.count({ where: { createdAt: { [Op.gte]: yesterday, [Op.lt]: today } } }),
  ]);
  percentage = calculatePercentage(todayNotifications, yesterdayNotifications);
  isPositive = todayNotifications >= yesterdayNotifications;
  const notifications_count = { value: notifications, isPositive, percentage };

  return {
    total_users,
    total_farmers,
    total_shops,
    total_products,
    orders_today,
    pending_products,
    active_shipments,
    delivered_shipments,
    pending_shipments,
    notifications_count,
  };
};
