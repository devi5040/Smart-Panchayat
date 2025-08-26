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

exports.getShops = async (req, res) => {
  try {
    const shops = await shopServices.getShops();
    res.status(200).json({ message: "✅ Shops fetched successfully!", shops });
  } catch (error) {
    logger.error(`Internal error while fetching the shops: ${error}`);
    res.status(500).json({
      message:
        "⚠️ An internal error occurred while fetching the shops. Please try again later.",
      error: error.message,
    });
  }
};

exports.getShopDetails = async (req, res) => {
  const { shopId } = req.params;
  try {
    const shop = await shopServices.getShopDetails(shopId);
    res
      .status(200)
      .json({ message: "✅ Shop details fetched successfully!", shop });
  } catch (error) {
    logger.error(`Internal error while fetching shop details: ${error}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while fetching shop details. Please try again later.",
      error: error.message,
    });
  }
};

exports.updateShopDetails = async (req, res) => {
  const { shopId } = req.params;
  const userId = req.user.id;
  const { name, pinCode, latitude, longitude } = req.body;
  try {
    const shopDetails = await shopServices.updateShopDetails(
      userId,
      shopId,
      name,
      pinCode,
      latitude,
      longitude
    );
    res
      .status(200)
      .json({ message: "✅ Shop details updated successfully!", shopDetails });
  } catch (error) {
    logger.error(`Internal error while updating the shop: ${error}`);
    const status = error.statusCode || 500;
    res
      .status(status)
      .json({
        message:
          "⚠️ An internal error occurred while updating the shop. Please try again later.",
        error: error.message,
      });
  }
};
