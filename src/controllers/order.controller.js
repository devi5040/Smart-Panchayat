const orderServices = require("../services/order.service");
const logger = require("../utils/logger");

exports.addOrder = async (req, res) => {
  const { orderData, items } = req.body;
  try {
    const order = await orderServices.addOrder(orderData, items);
    res.status(201).json({ message: "✅ Order added successfully!", order });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while adding an order: ${error}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while adding the order. Please try again later.",
      error: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await orderServices.getOrders();
    res
      .status(200)
      .json({ message: "✅ Orders data fetched successfully!", orders });
  } catch (error) {
    logger.error(`Internal error while fetching orders data: ${error}`);
    res.status(500).json({
      message:
        "⚠️ An internal error occurred while fetching orders data. Please try again later!",
      error: error.message,
    });
  }
};

exports.getOrderHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await orderServices.getOrderHistory(userId);
    res
      .status(200)
      .json({ message: "✅ Orders history fetched successfully!", orders });
  } catch (error) {
    logger.error(`Internal error while fetching order history:${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching order history. Please try again later!",
      error: error.message,
    });
  }
};

exports.getOrdersByCollectionCentre = async (req, res) => {
  const { collectionCentre } = req.params;
  try {
    const orders = await orderServices.getOrderByCollectionCentre(
      collectionCentre
    );
    res
      .status(200)
      .json({ message: "✅ Orders fetched successfully!", orders });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while fetching orders by collection centre: ${error}`
    );
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching orders data. Please try again later!",
      error: error.message,
    });
  }
};

exports.getOrdersByPaymentStatus = async (req, res) => {
  const { paymentStatus } = req.params;
  try {
    const orders = await orderServices.getOrderByPaymentStatus(paymentStatus);
    res
      .status(200)
      .json({ message: "✅ Orders fetched successfully!", orders });
  } catch (error) {
    logger.error(`Internal error while fetching Orders data: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching orders data. Please try again later!",
      error: error.message,
    });
  }
};

exports.updateOrderPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;
  try {
    const order = await orderServices.updatePaymentStatus(
      orderId,
      paymentStatus
    );
    res.status(200).json({ message: "✅ Order updated successfully!", order });
  } catch (error) {
    logger.error(`Internal error while updating the order: ${error}`);
    const status = error.statusCode;
    res
      .status(status)
      .json({
        message:
          "⚠️ An internal error occurred while updating the order. Please try again later.",
        error: error.message,
      });
  }
};
