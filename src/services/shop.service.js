const { Shops } = require("../models");

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
