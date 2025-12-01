/**
 * @filename index.js
 * @description This file defines the database relationships between different entities using Sequelize. It establishes associations such as
 * one-to-one between Users and Shops, many-to-many between Shops and Products, Orders and Products, and Shipments and Shops.
 * It also defines relationships to manage order items and shipment details, ensuring data integrity and efficient data retrieval.
 *
 * @version v1.0.0
 * @created Aug 19 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const Users = require('./user');
const Shops = require('./shop');
const Products = require('./products');
const ShopProducts = require('./shopProducts');
const Orders = require('./orders');
const OrderItems = require('./orderItems');
const Shipments = require('./shipments');
const ShipmentShops = require('./shipmentShops');
const ShipmentShopProducts = require('./shipmentShopsProducts');
const Category = require('./category');
const CollectionCentre = require('./collectionCentre');

// One-to-One: User <-> Shop
// A User has exactly one Shop.
// OnDelete: NULL and onUpdate: CASCADE -> defaults for one-to-one relationships.
Users.hasOne(Shops, { onDelete: 'CASCADE' });
Shops.belongsTo(Users);

// Many-to-Many: Shops <-> Products.
// A shop can have multiple products. A product is available in multiple shops.
// Defaults=> OnDelete: CASCADE and onUpdate: CASCADE
Shops.belongsToMany(Products, { through: ShopProducts });
Products.belongsToMany(Shops, { through: ShopProducts });

// Many-to-Many: Orders <-> Products
// An order can have multiple Products. A product is available in multiple Orders.
// Defaults: onDelete: CASCADE and onUpdate: CASCADE
Orders.belongsToMany(Products, { through: OrderItems });
Products.belongsToMany(Orders, { through: OrderItems });

// One-to-Many: Users <-> Orders
// An user can have multiple orders. An order belongs to only one user.
// Defaults: onDelete: NULL and onUpdate: CASCADE
Users.hasMany(Orders, { onDelete: 'CASCADE' });
Orders.belongsTo(Users);

// Many-to-Many: Shipments <-> Shops
// A shipment can include multiple shops. A shop can have multiple shipments.
// Defaults: onDelete: CASCADE and onUpdate: CASCADE
Shipments.belongsToMany(Shops, { through: ShipmentShops });
Shops.belongsToMany(Shipments, { through: ShipmentShops });

// Many-to-Many: ShipmentShops <-> Products
// A shipmentShop can have multiple products. A product belongs to multiple shipmentShops.
// Defaults: onDelete: CASCADE and onUpdate: CASCADE
ShipmentShops.belongsToMany(Products, { through: ShipmentShopProducts });
Products.belongsToMany(ShipmentShops, { through: ShipmentShopProducts });

// One-to-Many: Products <-> Category
// A category can have multiple products. A product belong to one category.
// Defaults: onDelete: NULL and onUpdate: CASCADE
Category.hasMany(Products, { onDelete: 'CASCADE' });
Products.belongsTo(Category);

ShipmentShops.belongsTo(Shipments);
Shipments.hasMany(ShipmentShops);

Users.belongsTo(CollectionCentre);
CollectionCentre.hasMany(Users);

module.exports = {
  Users,
  Shops,
  OrderItems,
  Orders,
  Products,
  Shipments,
  ShipmentShops,
  ShipmentShopProducts,
  ShopProducts,
  Category,
  CollectionCentre,
};
