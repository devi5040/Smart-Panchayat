/**JSDOC needs to be done */
const User = require("./user");
const Shop = require("./shop");

// Associations between shop and user (one-to-one)
User.hasOne(Shop, { onDelete: "CASCADE" });
Shop.belongsTo(User);

module.exports = { User, Shop };
