const router = require("express").Router();
const userRoutes = require("./user.route");
const categoryRoutes = require("./category.route");
const productRoutes = require("./product.route");
const shopRoutes = require("./shop.route");
const orderRoutes = require("./order.route");

router.use("/user", userRoutes);

router.use("/category", categoryRoutes);

router.use("/product", productRoutes);

router.use("/shop", shopRoutes);

router.use("/order", orderRoutes);

module.exports = router;
