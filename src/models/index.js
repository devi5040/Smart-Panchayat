/**JSDOC needs to be done */
const Users = require("./user");
const Shops = require("./shop");

// Associations between shop and user (one-to-one)
Users.hasOne(Shops, { onDelete: "CASCADE" });
Shops.belongsTo(Users);

module.exports = { Users, Shops };
