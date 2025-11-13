/**
 * @filename shipment.service.js
 * @description This service file manages shipment data, providing functionalities for creating, updating, and retrieving shipment details.  It
 * handles the relationships between shipments, shops, and products, ensuring data integrity through database transactions. The service offers
 * methods to list shipments, create new shipments with associated shops and products, update product quantities within existing shipments, add
 * shops to existing shipments, retrieve shipments by shop, status, or transportation mode, and remove products or shops from shipments.
 *
 * @version v1.0.0
 * @updated Sep 3, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const sequelize = require('../config/db');
const { Shipments, ShipmentShops, ShipmentShopProducts, Shops, Products } = require('../models');
const { ConflictError, NotFoundError, NoContentError } = require('../utils/error');

/**
 * Retrieves a list of all shipments.
 * Includes shipment details and associated shop status.
 * @async
 * @function getShipmentList
 * @returns {Array<Object>} An array of shipment objects, each containing shipment details and shop status.  Returns an empty array if no shipments are found.
 * @throws {Error} If an error occurs while fetching shipments.
 */
exports.getShipmentList = async () => {
  const shipments = await Shipments.findAll({
    attributes: ['id', 'date', 'location', 'collection_centre', 'transportation_mode'],
    include: { model: Shops, through: { attributes: ['status'] } },
  });
  if (!shipments) {
    //Returning empty array instead of throwing error for better error handling.
    return [];
  }
  const shipmentData = shipments.flatMap((shipment) =>
    shipment['shops'].map((sh) => ({
      id: shipment.id,
      collectionCentre: shipment.collection_centre,
      mode: shipment.transportation_mode,
      date: shipment.date,
      location: shipment.location,
      status: sh['shipment-shops'].status,
    })),
  );
  return shipmentData;
};

/**
 * Creates a new shipment.  Handles creation of associated ShipmentShops and ShipmentShopProducts records.
 * @async
 * @function createShipment
 * @param {Object} shipmentDetails - Details of the shipment.
 * @param {Object} shipmentDetails.date - The date of the shipment.
 * @param {string} shipmentDetails.location - The location of the shipment.
 * @param {string} shipmentDetails.collectionCentre - The collection centre of the shipment.
 * @param {string} shipmentDetails.transportationMode - The mode of transportation.
 * @param {Array<Object>} shops - An array of shop objects, each containing shopId and products.
 * @param {number} shops[].shopId - The ID of the shop.
 * @param {Array<Object>} shops[].products - An array of product objects, each containing productId and quantity.
 * @param {number} shops[].products[].productId - The ID of the product.
 * @param {number} shops[].products[].quantity - The quantity of the product.
 * @returns {Array<Object>} An array of shipment objects including associated shop details. Returns null if shipment creation fails.
 * @throws {ConflictError} If a shipment with the same details already exists.
 * @throws {NotFoundError} If a shop or product does not exist.
 * @throws {Error} If an error occurs during shipment creation.
 */
exports.createShipment = async (shipmentDetails, shops) => {
  const { date, location, collectionCentre, transportationMode } = shipmentDetails;
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
        '❌ The shipment already exists. Please update the existing shipment.',
      );
    const shipment = await Shipments.create(
      {
        date,
        location,
        collection_centre: collectionCentre,
        transportation_mode: transportationMode,
      },
      { transaction: t },
    );
    if (!shipment) throw new Error('❌ Shipment not created.');
    for (const shop of shops) {
      const shopId = shop.shopId;
      const shopData = await Shops.findByPk(shopId, { transaction: t });
      if (!shopData) throw new NotFoundError('❌ Shop does not exist.');
      const shipmentShops = await ShipmentShops.create(
        {
          shopId,
          shipmentId: shipment.id,
        },
        { transaction: t },
      );
      if (!shipmentShops) throw new Error('❌ Shipment shops not created.');

      for (const product of shop.products) {
        const { quantity, productId } = product;
        const productData = await Products.findByPk(productId, {
          transaction: t,
        });
        if (!productData) throw new NotFoundError('❌ Product does not exist.');
        const shipmentShopProduct = await ShipmentShopProducts.create(
          {
            quantity,
            productId,
            shipmentShopId: shipmentShops.id,
          },
          { transaction: t },
        );
        if (!shipmentShopProduct) throw new Error('❌ Shipment shops not created.');
      }
    }
    const shipmentData = await Shipments.findAll({
      attributes: ['id', 'date', 'collection_centre', 'transportation_mode'],
      include: {
        model: Shops,
        attributes: ['shop_name_en', 'shop_name_kn', 'id', 'latitude', 'longitude', 'pin_code'],
        through: { attributes: ['status'] },
      },
      transaction: t,
    });
    if (!shipmentData) throw new Error('Error finding shipments');
    return shipmentData;
  });
};

/**
 * Updates the quantity of a product in a specific shipment.
 * @async
 * @function updateShipmentProduct
 * @param {number} shipmentId - The ID of the shipment.
 * @param {number} shopId - The ID of the shop.
 * @param {number} productId - The ID of the product.
 * @param {number} quantity - The new quantity of the product.
 * @returns {Object} The updated ShipmentShopProduct object. Returns null if update fails.
 * @throws {NotFoundError} If the shipment, shop, or product does not exist.
 * @throws {NoContentError} If no rows were updated.
 * @throws {Error} If an error occurs during the update.
 */
exports.updateShipmentProduct = async (shipmentId, shopId, productId, quantity) => {
  return await sequelize.transaction(async (t) => {
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError('Shipment Not found');
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError('Shop not found!');
    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) throw new NotFoundError('Product not found');
    const shipmentShop = await ShipmentShops.findOne({
      where: { shipmentId, shopId },
      transaction: t,
      attributes: ['id'],
    });
    let shipmentShopProduct = await ShipmentShopProducts.findOne({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    if (shipmentShopProduct) {
      const [numRowsUpdated] = await ShipmentShopProducts.update(
        { quantity },
        { where: { id: shipmentShopProduct.id }, transaction: t },
      );
      if (numRowsUpdated == 0) throw new NoContentError('No rows updateds');
    } else {
      await ShipmentShopProducts.create(
        { quantity, productId, shipmentShopId: shipmentShop.id },
        { transaction: t },
      );
    }
    const data = await ShipmentShopProducts.findOne({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    return data;
  });
};

/**
 * Adds shops to an existing shipment.
 * @async
 * @function addShopsToShipments
 * @param {number} shipmentId - The ID of the shipment.
 * @param {number} shopId - The ID of the shop to add.
 * @param {Array<Object>} products - An array of product objects to add.
 * @param {number} products[].productId - The ID of the product.
 * @param {number} products[].quantity - The quantity of the product.
 * @returns {Object} The updated shipment object including associated shops and products. Returns null if addition fails.
 * @throws {NotFoundError} If the shipment or shop does not exist, or if a product does not exist.
 * @throws {ConflictError} If the shop is already associated with the shipment.
 * @throws {Error} If an error occurs during the addition.
 */
exports.addShopsToShipments = async (shipmentId, shopId, products) => {
  return await sequelize.transaction(async (t) => {
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError('❌ Shop does not exist.');
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError('❌ Shipment does not exist');
    const existsData = await ShipmentShops.findAll({
      where: { shopId, shipmentId },
      transaction: t,
    });
    if (existsData && existsData?.length > 0)
      throw new ConflictError('Shop already exists in the given shipment');
    const shipmentShops = await ShipmentShops.create({ shopId, shipmentId }, { transaction: t });
    for (const product of products) {
      const { quantity, productId } = product;
      const existingProduct = await Products.findByPk(productId, {
        transaction: t,
      });
      if (!existingProduct)
        throw new NotFoundError(`Product with product id ${productId} not found`);
      const shipmentShopProduct = await ShipmentShopProducts.create(
        {
          quantity,
          productId,
          shipmentShopId: shipmentShops.id,
        },
        { transaction: t },
      );
      if (!shipmentShopProduct) throw new Error('shipment shop product not created');
    }
    const shipmentData = await Shipments.findByPk(shipmentId, {
      attributes: ['id', 'date', 'collection_centre', 'transportation_mode'],
      include: {
        model: Shops,
        attributes: ['shop_name_en', 'shop_name_kn', 'id', 'latitude', 'longitude', 'pin_code'],
        through: { attributes: ['status'] },
      },
      transaction: t,
    });
    if (!shipmentData) throw new Error('Error finding shipments');
    return shipmentData;
  });
};

/**
 * Retrieves shipment details for a given shop.
 * @async
 * @function getShipmentForShop
 * @param {number} shopId - The ID of the shop.
 * @returns {Array<Object>} An array of product objects associated with the shop's shipments, including shipment status. Returns an empty array if no data is found.
 * @throws {NotFoundError} If the shop does not exist.
 * @throws {Error} If an error occurs during data retrieval.
 */
exports.getShipmentForShop = async (userId, pageNo) => {
  const shop = await Shops.findOne({ where: { userId: userId } });
  if (!shop) throw new NotFoundError('Shop not found');
  const shopId = shop.id.toString();

  const page = parseInt(pageNo) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows: shipmentData } = await Shipments.findAndCountAll({
    include: [
      {
        model: ShipmentShops,
        attributes: ['status'],
        where: { shopId },
        required: true,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);

  //Returning empty array instead of throwing error for better error handling.
  if (!shipmentData) return [];
  const products = shipmentData.flatMap((shipment) =>
    shipment['shipment-shops'].map((shop) => ({
      id: shipment.id,
      date: shipment.date,
      collectionCentre: shipment.collection_centre,
      transportationMode: shipment.transportation_mode,
      status: shop.status,
    })),
  );
  return { shipments: products, totalPages };
};

/**
 * Retrieves shipments filtered by status.
 * @async
 * @function getShipmentsByStatus
 * @param {string} status - The status to filter by.
 * @returns {Array<Object>} An array of shipment objects that match the provided status. Returns an empty array if no data found.
 * @throws {Error} If an error occurs while fetching shipments.
 */
exports.getShipmentsByStatus = async (status) => {
  const shipmentData = await Shipments.findAll({
    attributes: ['id', 'date', 'location', 'collection_centre', 'transportation_mode'],
    include: {
      model: Shops,
      through: { attributes: ['status'], where: { status } },
    },
  });
  //Returning empty array instead of throwing error for better error handling.
  if (!shipmentData) return [];
  const shipments = shipmentData.flatMap((shipment) =>
    shipment['shops'].map((sh) => ({
      id: shipment.id,
      location: shipment.location,
      mode: shipment.transportation_mode,
      collectionCentre: shipment.collection_centre,
      status: sh['shipment-shops'].status,
    })),
  );
  return shipments;
};

/**
 * Retrieves shipments filtered by transportation mode.
 * @async
 * @function getShipmentsByMode
 * @param {string} mode - The transportation mode to filter by.
 * @returns {Array<Object>} An array of shipment objects that match the provided transportation mode. Returns an empty array if no data is found.
 * @throws {Error} If an error occurs while fetching shipments.
 */
exports.getShipmentsByMode = async (mode) => {
  const shipmentData = await Shipments.findAll({
    where: { transportation_mode: mode },
    attributes: ['id', 'date', 'collection_centre', 'transportation_mode', 'location'],
    include: [
      {
        model: Shops,
        through: {
          attributes: ['status'],
        },
      },
    ],
  });
  //Returning empty array instead of throwing error for better error handling.
  if (!shipmentData) return [];
  const shipments = shipmentData.flatMap((shipment) =>
    shipment['shops'].map((sh) => ({
      id: shipment.id,
      date: shipment.date,
      mode: shipment.transportation_mode,
      collectionCentre: shipment.collection_centre,
      status: sh['shipment-shops'].status,
    })),
  );
  return shipments;
};

/**
 * Removes a product from a shipment.
 * @async
 * @function removeProductFromShipment
 * @param {number} shipmentId - The ID of the shipment.
 * @param {number} shopId - The ID of the shop.
 * @param {number} productId - The ID of the product to remove.
 * @returns {Object} The ShipmentShopProduct object after removal (will be null if product not found). Returns null if removal fails.
 * @throws {NotFoundError} If the shipment, shop, or product does not exist.
 * @throws {NoContentError} If no rows were deleted.
 * @throws {Error} If an error occurs during removal.
 */
exports.removeProductFromShipment = async (shipmentId, shopId, productId) => {
  return await sequelize.transaction(async (t) => {
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError('shipment not found');
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError('Shop not found');
    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) throw new NotFoundError('Product not found!');
    const shipmentShop = await ShipmentShops.findOne({
      where: { shopId, shipmentId },
      attributes: ['id'],
      transaction: t,
    });
    if (!shipmentShop) throw new Error('shipment shop not found');
    const rowsDeleted = await ShipmentShopProducts.destroy({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    if (rowsDeleted == 0) throw new NoContentError('No rows deleted');
    const data = await ShipmentShopProducts.findOne({
      where: { shipmentShopId: shipmentShop.id, productId },
      transaction: t,
    });
    return data;
  });
};

/**
 * Removes a shop from a shipment.
 * @async
 * @function removeShopFromShipment
 * @param {number} shipmentId - The ID of the shipment.
 * @param {number} shopId - The ID of the shop to remove.
 * @returns {Array<Object>} An array of ShipmentShops objects associated with the shipment after the removal. Returns an empty array if no shops are left.
 * @throws {NotFoundError} If the shipment or shop does not exist.
 * @throws {NoContentError} If no rows were deleted.
 * @throws {Error} If an error occurs during removal.
 */
exports.removeShopFromShipment = async (shipmentId, shopId) => {
  return await sequelize.transaction(async (t) => {
    const shipment = await Shipments.findByPk(shipmentId, { transaction: t });
    if (!shipment) throw new NotFoundError('Shipment not found!');
    const shop = await Shops.findByPk(shopId, { transaction: t });
    if (!shop) throw new NotFoundError('Shop not found!');
    const shipmentShop = await ShipmentShops.findOne({
      where: { shipmentId, shopId },
      transaction: t,
    });
    if (!shipmentShop) throw new NotFoundError('Shipment shop not exists');
    const numRowsDeleted = await ShipmentShops.destroy({
      where: { id: shipmentShop.id },
      transaction: t,
    });
    if (numRowsDeleted == 0) throw new NoContentError('No rows deleted');
    const shops = await ShipmentShops.findAll({
      where: { shipmentId },
      transaction: t,
    });
    return shops;
  });
};

exports.updateShipmentStatus = async (shipmentId, shopId, status) => {
  const shipment = await Shipments.findByPk(shipmentId);
  if (!shipment) throw new NotFoundError('Shipment not found!');
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError('Shop not found!');
  const [numRowsUpdated] = await ShipmentShops.update(
    { status },
    { where: { shipmentId, shopId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const shipmentData = await ShipmentShops.findOne({ where: { shipmentId, shopId } });
  return shipmentData;
};

exports.getShipmentDetails = async (shipmentId, shopId) => {
  console.log(shipmentId, shopId);
  let result = {};
  const shop = await Shops.findByPk(shopId);
  if (!shop) throw new NotFoundError('Shop does not exists!');
  const shipment = await Shipments.findByPk(shipmentId);
  if (!shipment) throw new NotFoundError('Shipment does not found!');
  result.shipment = shipment;
  const shipmentShopProducts = await Products.findAll({
    include: [
      {
        model: ShipmentShops,
        where: { shipmentId, shopId },
        attributes: ['status', 'remarks'],
        through: {
          attributes: ['quantity'],
        },
      },
    ],
  });
  // Convert Sequelize objects to plain JS
  const plainProducts = shipmentShopProducts.map((p) => p.toJSON());

  const shipmentShop = await ShipmentShops.findOne({
    where: { shipmentId, shopId },
    attributes: ['id', 'status', 'remarks'],
  });
  if (!shipmentShop) throw new NotFoundError('Shipment does not exists for your shop!');

  result.shipmentShop = shipmentShop;
  // Extract product list with quantities
  const shipmentShopProductsList = plainProducts.map((p) => ({
    id: p.id,
    name_en: p.name_en,
    name_kn: p.name_kn,
    price: p.price,
    image: p.image,
    categoryId: p.categoryId,
    quantity: p['shipment-shops']?.[0]?.['shipment-shop-products']?.quantity ?? 0,
  }));
  result.shipmentShopProducts = shipmentShopProductsList;
  return result;
};
