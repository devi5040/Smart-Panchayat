const sequelize = require("../config/db");
const {
  Shipments,
  ShipmentShops,
  ShipmentShopProducts,
  Shops,
  Products,
} = require("../models");
const {
  ConflictError,
  NotFoundError,
  NoContentError,
} = require("../utils/error");

exports.getShipmentList = async () => {
  const shipments = await Shipments.findAll({
    attributes: [
      "id",
      "date",
      "location",
      "collection_centre",
      "transportation_mode",
    ],
    include: { model: Shops, through: { attributes: ["status"] } },
  });
  if (!shipments) throw new Error("Error finding shipments");
  const shipmentData = shipments.flatMap((shipment) =>
    shipment["shops"].map((sh) => ({
      id: shipment.id,
      collectionCentre: shipment.collection_centre,
      mode: shipment.transportation_mode,
      date: shipment.date,
      location: shipment.location,
      status: sh["shipment-shops"].status,
    }))
  );
  return shipmentData;
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

exports.updateShipmentProduct = async (
  shipmentId,
  shopId,
  productId,
  quantity
) => {
  return await sequelize.transaction(async (t) => {
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError("Shipment Not found");
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError("Shop not found!");
    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) throw new NotFoundError("Product not found");
    const shipmentShop = await ShipmentShops.findOne({
      where: { shipmentId, shopId },
      transaction: t,
      attributes: ["id"],
    });
    console.log(`shipmentshop: ${JSON.stringify(shipmentShop)}`);
    let shipmentShopProduct = await ShipmentShopProducts.findOne({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    console.log(`shipmentshop product: ${JSON.stringify(shipmentShopProduct)}`);
    if (shipmentShopProduct) {
      const [numRowsUpdated] = await ShipmentShopProducts.update(
        { quantity },
        { where: { id: shipmentShopProduct.id }, transaction: t }
      );
      if (numRowsUpdated == 0) throw new NoContentError("No rows updateds");
    } else {
      await ShipmentShopProducts.create(
        { quantity, productId, shipmentShopId: shipmentShop.id },
        { transaction: t }
      );
    }
    const data = await ShipmentShopProducts.findOne({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    return data;
  });
};

// add a shop data for shipment table
exports.addShopsToShipments = async (shipmentId, shopId, products) => {
  return await sequelize.transaction(async (t) => {
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError("❌ Shop does not exist.");
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError("❌ Shipment does not exist");
    const existsData = await ShipmentShops.findAll({
      where: { shopId, shipmentId },
      transaction: t,
    });
    if (existsData && existsData?.length > 0)
      throw new ConflictError("Shop already exists in the given shipment");
    const shipmentShops = await ShipmentShops.create(
      { shopId, shipmentId },
      { transaction: t }
    );
    for (const product of products) {
      const { quantity, productId } = product;
      const existingProduct = await Products.findByPk(productId, {
        transaction: t,
      });
      if (!existingProduct)
        throw new NotFoundError(
          `Product with product id ${productId} not found`
        );
      const shipmentShopProduct = await ShipmentShopProducts.create(
        {
          quantity,
          productId,
          shipmentShopId: shipmentShops.id,
        },
        { transaction: t }
      );
      if (!shipmentShopProduct)
        throw new Error("shipment shop product not created");
    }
    const shipmentData = await Shipments.findByPk(shipmentId, {
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

exports.getShipmentForShop = async (shopId) => {
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError("Shop not found");
  const shipmentProducts = await Products.findAll({
    attributes: ["id", "name", "price"],
    include: [
      {
        model: ShipmentShops,
        where: { shopId },
        attributes: ["id", "status"],
        through: { attributes: [] },
      },
    ],
  });

  // flatten the result to get seperate product data
  const products = shipmentProducts.flatMap((shipmentProduct) =>
    shipmentProduct["shipment-shops"].map((sh) => ({
      id: shipmentProduct.id,
      name: shipmentProduct.name,
      price: shipmentProduct.price,
      shipmentShopId: sh.id,
      status: sh.status,
    }))
  );
  return products;
};

exports.getShipmentsByStatus = async (status) => {
  const shipmentData = await Shipments.findAll({
    attributes: [
      "id",
      "date",
      "location",
      "collection_centre",
      "transportation_mode",
    ],
    include: {
      model: Shops,
      through: { attributes: ["status"], where: { status } },
    },
  });
  if (!shipmentData) throw new Error("Could not find shipment data");
  const shipments = shipmentData.flatMap((shipment) =>
    shipment["shops"].map((sh) => ({
      id: shipment.id,
      location: shipment.location,
      mode: shipment.transportation_mode,
      collectionCentre: shipment.collection_centre,
      status: sh["shipment-shops"].status,
    }))
  );
  return shipments;
};

exports.getShipmentsByMode = async (mode) => {
  const shipmentData = await Shipments.findAll({
    where: { transportation_mode: mode },
    attributes: [
      "id",
      "date",
      "collection_centre",
      "transportation_mode",
      "location",
    ],
    include: [
      {
        model: Shops,
        through: {
          attributes: ["status"],
        },
      },
    ],
  });
  if (!shipmentData) throw new Error("Could not find shipments");

  const shipments = shipmentData.flatMap((shipment) =>
    shipment["shops"].map((sh) => ({
      id: shipment.id,
      date: shipment.date,
      mode: shipment.transportation_mode,
      collectionCentre: shipment.collection_centre,
      status: sh["shipment-shops"].status,
    }))
  );
  return shipments;
};
