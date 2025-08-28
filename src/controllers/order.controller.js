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
