const shopServices = require("../services/shop.service");
const logger = require("../utils/logger");

exports.addShop = async (req, res) => {
  const userId = req.user.id;
  const { name, pin_code, latitude, longitude } = req.body;
  try {
    const shop = await shopServices.addShop(
      name,
      pin_code,
      latitude,
      longitude,
      userId
    );
    res
      .status(201)
      .json({ message: "Shop has been created successfully! 🚀", shop });
  } catch (error) {
    logger.error(`Internal error while creating the shop: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while creating the shop. Please try again later.",
      error: error.message,
    });
  }
};
