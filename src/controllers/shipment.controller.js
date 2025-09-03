const shipmentServices = require("../services/shipment.service");
const logger = require("../utils/logger");

exports.getShipmentList = async (req, res) => {
  try {
    const shipments = await shipmentServices.getShipmentList();
    res
      .status(200)
      .json({ message: "✅ Shipments fetched successfully!", shipments });
  } catch (error) {
    logger.error(`Internal error while fetching shipments: ${error}`);
    res.status(500).json({
      message:
        "⚠️ An internal error occurred while fetching shipments. Please try again later.",
      error: error.message,
    });
  }
};

exports.createShipment = async (req, res) => {
  const { shipmentDetails, shops } = req.body;
  try {
    const shipment = await shipmentServices.createShipment(
      shipmentDetails,
      shops
    );
    res
      .status(201)
      .json({ message: "✅ Shipment created successfully!", shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while creating the shipment: ${error}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while creating the shipment. Please try again later.",
      error: error.message,
    });
  }
};

exports.addShopToShipment = async (req, res) => {
  const { shipmentId, shopId, products } = req.body;
  try {
    const shipment = await shipmentServices.addShopsToShipments(
      shipmentId,
      shopId,
      products
    );
    res.status(201).json({
      message: "Shop and products added to the shipment successfully.",
      shipment,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while updating the shipment with shop and product: ${error}`
    );
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while creating the shipment. Please try again later.",
      error: error.message,
    });
  }
};

exports.getShipmentForShops = async (req, res) => {
  const { shopId } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentForShop(shopId);
    res
      .status(200)
      .json({ message: "Shipment fetched successfully!", shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(
      `Internal error while fetching the shipment data for shops: ${shopId}`
    );
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.",
      error: error.message,
    });
  }
};

exports.getShipmentByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentsByStatus(status);
    res
      .status(200)
      .json({ message: "Shipment fetched successfully!", shipment });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching shipment by status: ${status}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.",
      error: error.message,
    });
  }
};

exports.getShipmentByTransportationMode = async (req, res) => {
  const { mode } = req.params;
  try {
    const shipment = await shipmentServices.getShipmentsByMode(mode);
    res
      .status(200)
      .json({ message: "Shipment fetched successfully!", shipment });
  } catch (error) {
    logger.error(
      `Internal error while fetching the shipment by transportation mode: ${error}`
    );
    res
      .status(500)
      .json({
        message:
          "⚠️ An internal error occurred while fetching the shipment data for shops. Please try again later.",
        error: error.message,
      });
  }
};
