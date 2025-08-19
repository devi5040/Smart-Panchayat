/**JSDOC needs to be done */
const Users = require("./user");
const Shops = require("./shop");
const Products = require("./products");
const ShopProducts = require("./shopProducts");
const Orders = require("./orders");
const OrderItems = require("./orderItems");

// One-to-One: User <-> Shop
// A User has exactly one Shop.
// OnDelete: NULL and onUpdate: CASCADE -> defaults for one-to-one relationships.
Users.hasOne(Shops, { onDelete: "CASCADE" });
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

module.exports = { Users, Shops };
