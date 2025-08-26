const { Shops } = require("../models");
const { ConflictError, NotFoundError } = require("../utils/error");

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

exports.getShops = async () => {
  try {
    const shops = await Shops.findAll();
    return shops;
  } catch (error) {
    throw error;
  }
};

exports.getShopDetails = async (shopId) => {
  if (!shopId || isNaN(shopId)) throw new Error("Invalid shop id");
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError("Shop not found");
  return shop;
};

exports.updateShopDetails = async (
  userId,
  shopId,
  name,
  pinCode,
  latitude,
  longitude
) => {
  const shop = await Shops.findOne({ where: { userId, id: shopId } });
  if (!shop) throw new NotFoundError("Shop not found");
  const [numRowsUpdated] = await Shops.update(
    {
      shop_name: name,
      pin_code: pinCode,
      latitude,
      longitude,
    },
    { where: { userId, id: shopId } }
  );
  if (numRowsUpdated == 0) throw new Error("Shop cannot be updated");
  const updatedShop = await Shops.findOne({ where: { id: shopId, userId } });
  if (!updatedShop) {
    throw new NotFoundError("Shop not found for this user");
  }
  return updatedShop;
};
