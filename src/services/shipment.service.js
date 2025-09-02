const {
  Shipments,
  ShipmentShops,
  ShipmentShopProducts,
  Shops,
  Products,
} = require("../models");

exports.getShipmentList = async () => {
  const shipments = await Shipments.findAll({
    attributes: ["id", "date", "collection_centre", "transportation_mode"],
    include: { model: Shops, through: { attributes: ["status"] } },
  });
  if (!shipments) throw new Error("Error finding shipments");
  return shipments;
};
