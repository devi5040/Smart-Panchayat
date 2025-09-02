const sequelize = require("../config/db");
const {
  Shipments,
  ShipmentShops,
  ShipmentShopProducts,
  Shops,
  Products,
} = require("../models");
const { ConflictError, NotFoundError } = require("../utils/error");

exports.getShipmentList = async () => {
  const shipments = await Shipments.findAll({
    attributes: ["id", "date", "collection_centre", "transportation_mode"],
    include: { model: Shops, through: { attributes: ["status"] } },
  });
  if (!shipments) throw new Error("Error finding shipments");
  return shipments;
};

// shipment details with location and transportation mode
exports.createShipment = async (shipmentDetails, shops) => {
  const { date, location, collectionCentre, transportationMode } =
    shipmentDetails;
  return await sequelize.transaction(async (t) => {
    const existingShipment = await Shipments.findAll({
      where: {
        date,
        location,
        collection_centre: collectionCentre,
        transportation_mode: transportationMode,
      },
      transaction: t,
    });
    if (existingShipment && existingShipment?.length > 0)
      throw new ConflictError(
        "❌ The shipment already exists. Please update the existing shipment."
      );
    const shipment = await Shipments.create(
      {
        date,
        location,
        collection_centre: collectionCentre,
        transportation_mode: transportationMode,
      },
      { transaction: t }
    );
    if (!shipment) throw new Error("❌ Shipment not created.");
    for (const shop of shops) {
      const shopId = shop.shopId;
      const shopData = await Shops.findByPk(shopId, { transaction: t });
      if (!shopData) throw new NotFoundError("❌ Shop does not exist.");
      const shipmentShops = await ShipmentShops.create(
        {
          shopId,
          shipmentId: shipment.id,
        },
        { transaction: t }
      );
      if (!shipmentShops) throw new Error("❌ Shipment shops not created.");

      for (const product of shop.products) {
        const { quantity, productId } = product;
        const productData = await Products.findByPk(productId, {
          transaction: t,
        });
        if (!productData) throw new NotFoundError("❌ Product does not exist.");
        const shipmentShopProduct = await ShipmentShopProducts.create(
          {
            quantity,
            productId,
            shipmentShopId: shipmentShops.id,
          },
          { transaction: t }
        );
        if (!shipmentShopProduct)
          throw new Error("❌ Shipment shops not created.");
      }
    }
    const shipmentData = await Shipments.findAll({
      attributes: ["id", "date", "collection_centre", "transportation_mode"],
      include: {
        model: Shops,
        attributes: ["shop_name", "id", "latitude", "longitude", "pin_code"],
        through: { attributes: ["status"] },
      },
      transaction: t,
    });
    if (!shipmentData) throw new Error("Error finding shipments");
    return shipmentData;
  });
};
