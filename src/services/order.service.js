/**
 * @filename order.service.js
 * @description This file provides a comprehensive set of functions for managing orders, including adding new orders, retrieving order history,
 * and updating order details.  It interacts with database models for Users, Orders, Products, and OrderItems to ensure data integrity and
 * consistency. The functions handle various scenarios, including checking for the existence of users and products, and providing informative
 * error messages.
 *
 * @version v1.0.0
 * @updated August 29, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const sequelize = require('../config/db');
const { OrderItems, Orders, Users, Products, CollectionCentre } = require('../models');
const { NotFoundError } = require('../utils/error');

/**
 * Adds a new order to the database.  Handles creation of associated order items.
 * Uses Sequelize transactions to ensure atomicity.
 * @async
 * @param {object} orderData - Data for the order (collectionCentre, paymentStatus, userId).
 * @param {Array<object>} items - Array of order items, each with quantity, quality, and productId.
 * @param {string} orderData.collectionCentre - The collection centre for the order.
 * @param {string} [orderData.paymentStatus="pending"] - Payment status of the order (defaults to "pending").
 * @param {number} orderData.userId - The ID of the user placing the order.
 * @throws {NotFoundError} If the user or any of the products do not exist.
 * @throws {Error} If no rows are updated after creating the order.
 * @returns {Promise<Order>} The created order instance with associated products.  Includes quantity and product_quality from the OrderItems join table.
 */
exports.addOrder = async (orderData, items, agentUserId) => {
  const { paymentStatus = 'pending', userId } = orderData;

  return await sequelize.transaction(async (t) => {
    const agent = await Users.findByPk(agentUserId);
    if (!agent) throw new NotFoundError('Agent not found!');

    const collectionCentreId = agent.collectionCentreId;
    // Check if user exists
    const user = await Users.findByPk(userId, { transaction: t });
    if (!user) throw new NotFoundError('❌ User not found!');

    // Create order
    const order = await Orders.create(
      {
        price: 1, // Initial price, updated later
        collectionCentreId,
        payment_status: paymentStatus,
        userId,
      },
      { transaction: t },
    );

    let totalPrice = 0;

    for (const item of items) {
      const { quantity, quality, productId } = item;

      // Check if product exists
      const product = await Products.findByPk(productId, { transaction: t });
      if (!product) throw new NotFoundError('❌ Product not found!');

      totalPrice += product.price * quantity; // Accumulate total price

      // Insert into order-items table
      await OrderItems.create(
        {
          price: product.price * quantity,
          quantity,
          product_quality: quality,
          productId,
          orderId: order.id,
        },
        { transaction: t },
      );
    }

    // Update order price with calculated total
    const [numRowsUpdated] = await Orders.update(
      { price: totalPrice },
      { where: { id: order.id }, transaction: t },
    );
    if (numRowsUpdated === 0) throw new Error('No rows updated');

    // Return the order with included products
    const orderData = await Orders.findByPk(order.id, {
      include: {
        model: Products,
        through: { attributes: ['quantity', 'product_quality'] },
      },
      transaction: t,
    });
    return orderData;
  });
};

/**
 * Retrieves all orders from the database. Includes associated products.
 * @async
 * @returns {Promise<Order[]>} An array of Order instances, each with associated product information.  Includes quantity and product_quality from the OrderItems join table.
 * @throws {Error} If no orders are found.
 */
exports.getOrders = async () => {
  const orders = await Orders.findAll({
    include: {
      model: Products,
      through: { attributes: ['quantity', 'product_quality'] },
    },
  });
  if (!orders) throw new Error('Order is undefined/null'); //Improved error message
  return orders;
};

/**
 * Retrieves order history for a specific user. Includes associated products.
 * @async
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Order[]>} An array of Order instances for the specified user, each with associated product information. Includes quantity and product_quality from the OrderItems join table.
 * @throws {NotFoundError} If the user is not found.
 * @throws {Error} If no orders are found for the user.
 */
exports.getOrderHistory = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const orders = await Orders.findAll({
    where: { userId },
    include: [
      {
        model: Products,
        through: { attributes: ['quantity', 'product_quality'] },
      },
      {
        model: CollectionCentre,
      },
    ],
  });
  if (!orders) throw new Error('Order data is undefined/null');
  return orders;
};

/**
 * Retrieves orders by collection centre. Includes associated products.
 * @async
 * @param {string} collectionCentre - The name of the collection centre.
 * @returns {Promise<Order[]>} An array of Order instances for the specified collection centre, each with associated product information. Includes quantity and product_quality from the OrderItems join table.
 * @throws {NotFoundError} If no orders are found for the specified collection centre.
 */
exports.getOrderByCollectionCentre = async (collectionCentre) => {
  const orders = await Orders.findAll({
    where: { collection_centre: collectionCentre },
    include: {
      model: Products,
      through: {
        attributes: ['quantity', 'product_quality'],
      },
    },
  });
  if (orders?.length === 0) throw new NotFoundError('Order not found');
  return orders;
};

/**
 * Retrieves orders by payment status. Includes associated products.
 * @async
 * @param {string} paymentStatus - The payment status.
 * @returns {Promise<Order[]>} An array of Order instances with the specified payment status, each with associated product information. Includes quantity and product_quality from the OrderItems join table.
 */
exports.getOrderByPaymentStatus = async (paymentStatus) => {
  const orders = await Orders.findAll({
    where: {
      payment_status: paymentStatus,
    },
    include: {
      model: Products,
      through: {
        attributes: ['quantity', 'product_quality'],
      },
    },
  });
  return orders;
};

/**
 * Updates the payment status of an order.
 * @async
 * @param {number} orderId - The ID of the order.
 * @param {string} paymentStatus - The new payment status.
 * @returns {Promise<Order>} The updated Order instance with associated product information. Includes quantity and product_quality from the OrderItems join table.
 * @throws {NotFoundError} If the order is not found.
 * @throws {Error} If no rows are updated.
 */
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const order = await Orders.findByPk(orderId);
  if (!order) throw new NotFoundError('Order not found!');
  const [numRowsUpdated] = await Orders.update(
    {
      payment_status: paymentStatus,
    },
    { where: { id: orderId } },
  );
  if (numRowsUpdated === 0) throw new Error('No rows are updated!');
  const orderData = await Orders.findByPk(orderId, {
    include: {
      model: Products,
      through: {
        attributes: ['quantity', 'product_quality'],
      },
    },
  });
  return orderData;
};

/**
 * Retrieves a single order by ID. Includes associated products.
 * @async
 * @param {number} orderId - The ID of the order.
 * @returns {Promise<Order>} The Order instance with associated product information. Includes quantity and product_quality from the OrderItems join table.
 * @throws {NotFoundError} If the order is not found.
 */
exports.getOrderById = async (orderId) => {
  const order = await Orders.findByPk(orderId, {
    include: [
      {
        model: Products,
        through: { attributes: ['quantity', 'product_quality'] },
      },
      {
        model: CollectionCentre,
      },
    ],
  });
  if (!order) throw new NotFoundError('Order not found');
  return order;
};

exports.getUsersOrder = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const order = await Orders.findAll({
    where: { userId },
    include: [
      {
        model: Products,
        attributes: ['id', 'name_en', 'name_kn'],
        through: {
          attributes: ['quantity', 'price'],
        },
      },
      {
        model: CollectionCentre,
      },
    ],
  });
  return order;
};
