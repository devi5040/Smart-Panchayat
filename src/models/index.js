/**JSDOC needs to be done */
const Users = require("./user");
const Shops = require("./shop");
const Products = require("./products");
const ShopProducts = require("./shopProducts");

Users.hasOne(Shops, { onDelete: "CASCADE" });
Shops.belongsTo(Users);

// Many-to-Many: Shops <-> Products.
// A shop can have multiple products. A product is available in multiple shops.
// OnDelete: CASCADE and onUpdate: CASCADE -> defaults for many-to-many relationships.s
Shops.belongsToMany(Products, {
  through: ShopProducts,
});
Products.belongsToMany(Shops, {
  through: ShopProducts,
});

module.exports = { Users, Shops };
