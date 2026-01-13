/**
 * @filename order.controller.js
 * @description This file defines the controllers for managing orders.  It handles various HTTP requests related to order creation, retrieval, and
 * updates, acting as an intermediary between the client and the order service layer.  Specifically, it provides endpoints for adding new orders,
 * retrieving all orders, fetching order history for a specific user, filtering orders by collection center or payment status, updating order
 * payment status, and retrieving a single order by ID.
 *
 * @version v1.0.0
 * @updated August 29, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
/**
 * Imports the order services module.
 * @module ../services/order.service
 */
const orderServices = require('../services/order.service');
/**
 * Imports the logger module for logging errors.
 * @module ../utils/logger
 */
const logger = require('../utils/logger');

/**
 * Adds a new order.
 * @async
 * @function addOrder
 * @param {object} req - The request object.
 * @param {object} req.body - The request body containing order data and items.
 * @param {object} req.body.orderData - The order data.  Example: `{userId: 1, collectionCentre: 'London'}`.  Structure depends on your Order model.
 * @param {Array<object>} req.body.items - An array of order items. Example: `[{productId: 1, quantity: 2}]`. Structure depends on your OrderItems model (if you have one, otherwise adjust accordingly).
 * @param {object} res - The response object.
 * @throws {Error} If there's an error adding the order.  The error might include a `statusCode` property.
 */
exports.addOrder = async (req, res) => {
  const { orderData, items } = req.body;
  try {
    const order = await orderServices.addOrder(orderData, items);
    res.status(201).json({ message: '✅ Order added successfully!', order });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while adding an order: ${error}`);
    res.status(status).json({
      message: '⚠️ An internal error occurred while adding the order. Please try again later.',
      error: error.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  const { orderData, items } = req.body;
  const { orderId } = req.params;
  try {
    const order = await orderServices.updateOrder(orderData, items, orderId);
    res.status(200).json({ message: '✅ Order updated successfully!', order });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while updating an order: ${error}`);
    res.status(status).json({
      message: '⚠️ An internal error occurred while updating the order. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Retrieves all orders.
 * @async
 * @function getOrders
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @throws {Error} If there's an error fetching orders.
 */
exports.getOrders = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const { orders, totalPages } = await orderServices.getOrders(page, limit);
    res.status(200).json({ message: '✅ Orders data fetched successfully!', orders, totalPages });
  } catch (error) {
    logger.error(`Internal error while fetching orders data: ${error}`);
    res.status(500).json({
      message: '⚠️ An internal error occurred while fetching orders data. Please try again later!',
      error: error.message,
    });
  }
};

/**
 * Retrieves the order history for a specific user.
 * @async
 * @function getOrderHistory
 * @param {object} req - The request object.
 * @param {object} req.user - The authenticated user object (presumably from middleware).  Must contain a property `id`.
 * @param {number} req.user.id - The ID of the authenticated user.
 * @param {object} res - The response object.
 * @throws {Error} If there's an error fetching order history. The error might include a `statusCode` property.
 */
exports.getOrderHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await orderServices.getOrderHistory(userId);
    res.status(200).json({ message: '✅ Orders history fetched successfully!', orders });
  } catch (error) {
    logger.error(`Internal error while fetching order history:${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        '⚠️ An internal error occurred while fetching order history. Please try again later!',
      error: error.message,
    });
  }
};

/**
 * Retrieves orders by collection centre.
 * @async
 * @function getOrdersByCollectionCentre
 * @param {object} req - The request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.collectionCentre - The name of the collection centre.
 * @param {object} res - The response object.
 * @throws {Error} If there's an error fetching orders by collection centre. The error might include a `statusCode` property.
 */
exports.getOrdersByCollectionCentre = async (req, res) => {
  const { collectionCentre } = req.params;
  try {
    const orders = await orderServices.getOrderByCollectionCentre(collectionCentre);
    res.status(200).json({ message: '✅ Orders fetched successfully!', orders });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching orders by collection centre: ${error}`);
    res.status(status).json({
      message: '⚠️ An internal error occurred while fetching orders data. Please try again later!',
      error: error.message,
    });
  }
};

/**
 * Retrieves orders by payment status.
 * @async
 * @function getOrdersByPaymentStatus
 * @param {object} req - The request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.paymentStatus - The payment status (e.g., 'paid', 'pending').
 * @param {object} res - The response object.
 * @throws {Error} If there's an error fetching orders by payment status. The error might include a `statusCode` property.
 */
exports.getOrdersByPaymentStatus = async (req, res) => {
  const { paymentStatus } = req.params;
  try {
    const orders = await orderServices.getOrderByPaymentStatus(paymentStatus);
    res.status(200).json({ message: '✅ Orders fetched successfully!', orders });
  } catch (error) {
    logger.error(`Internal error while fetching Orders data: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: '⚠️ An internal error occurred while fetching orders data. Please try again later!',
      error: error.message,
    });
  }
};

/**
 * Updates the payment status of an order.
 * @async
 * @function updateOrderPaymentStatus
 * @param {object} req - The request object.
 * @param {object} req.params - The request parameters.
 * @param {number} req.params.orderId - The ID of the order to update.
 * @param {object} req.body - The request body.
 * @param {string} req.body.paymentStatus - The new payment status.
 * @param {object} res - The response object.
 * @throws {Error} If there's an error updating the order. The error might include a `statusCode` property.
 */
exports.updateOrderPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;
  try {
    const order = await orderServices.updatePaymentStatus(orderId, paymentStatus);
    res.status(200).json({ message: '✅ Order updated successfully!', order });
  } catch (error) {
    logger.error(`Internal error while updating the order: ${error}`);
    const status = error.statusCode;
    res.status(status).json({
      message: '⚠️ An internal error occurred while updating the order. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * Retrieves an order by ID.
 * @async
 * @function getOrderByID
 * @param {object} req - The request object.
 * @param {object} req.params - The request parameters.
 * @param {number} req.params.orderId - The ID of the order to retrieve.
 * @param {object} res - The response object.
 * @throws {Error} If there's an error fetching the order by ID. The error might include a `statusCode` property.
 */
exports.getOrderByID = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await orderServices.getOrderById(orderId);
    res.status(200).json({ message: '✅ Order fetched successfully!', order });
  } catch (error) {
    logger.error(`Internal error while fetching order by ID: ${orderId}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: '⚠️ An internal error occurred while fetching order by ID. Please try again later!',
      error: error.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await orderServices.getUsersOrder(userId);
    res.status(200).json({ message: 'Fetched orders for the user successfully!', orders });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching the orders: ${error}`);
    res
      .status(status)
      .json({ message: 'Internal error while fetching the orders!', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const orders = await orderServices.deleteOrder(orderId);
    res.status(200).json({ message: 'Deleted orders for the user successfully!', orders });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while deleting the orders: ${error}`);
    res
      .status(status)
      .json({ message: 'Internal error while deleting the orders!', error: error.message });
  }
};
