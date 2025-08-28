const { Shops, Users, ShipmentShops } = require("../models");
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require("../utils/error");

exports.getShopIdbyUserId = async (userId) => {
  if (!userId || isNaN(userId)) throw new Error("User id is invalid");
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError("User not found.");
  const shop = await Shops.findOne({ where: { userId } });
  if (!shop) throw new Error("Shop does not found");
  return shop;
};

exports.addShop = async (name, pinCode, latitude, longitude, userId) => {
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
};

exports.getShops = async () => {
  const shops = await Shops.findAll();
  return shops;
};

exports.getShopDetails = async (shopId) => {
  if (!shopId || isNaN(shopId)) throw new BadRequestError("Invalid shop id");
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
  if (!updatedShop) throw new NotFoundError("Shop not found for this user");
  return updatedShop;
};

exports.addRemarksToShipments = async (shipmentId, remarks) => {
  if (!shipmentId) throw new Error("shipment id is invalid");
  const shipment = await ShipmentShops.findByPk(shipmentId);
  if (!shipment) throw new NotFoundError("Shipment not found");
  const [numRowsUpdated] = await ShipmentShops.update(
    { remarks },
    { where: { id: shipmentId } }
  );
  if (numRowsUpdated == 0) throw new Error("No records are updated.");
  const shipmentData = await ShipmentShops.findByPk(shipmentId);
  return shipmentData;
};
