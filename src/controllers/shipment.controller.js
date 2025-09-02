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
    res
      .status(500)
      .json({
        message:
          "⚠️ An internal error occurred while fetching shipments. Please try again later.",
        error: error.message,
      });
  }
};
