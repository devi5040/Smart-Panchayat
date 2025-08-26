const { Shops } = require("../models");
const { ConflictError } = require("../utils/error");

exports.getShopIdbyUserId = async (userId) => {
  if (!userId || isNaN(userId)) throw new Error("User id is invalid");
  try {
    const shop = await Shops.findOne({ where: { userId } });
    if (!shop || shop?.length == 0) throw new Error("Shop does not found");
    return shop;
  } catch (error) {
    throw error;
  }
};

exports.addShop = async (name, pinCode, latitude, longitude, userId) => {
  try {
    const shop = await Shops.findAll({ where: { userId } });
    if (shop || !shop?.length == 0)
      throw new ConflictError("Shop already exists for the user");
    const newShop = await Shops.create({
      shop_name: name,
      pin_code: pinCode,
      latitude,
      longitude,
      userId,
    });
    return newShop;
  } catch (error) {
    throw error;
  }
};
