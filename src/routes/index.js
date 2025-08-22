const router = require("express").Router();
const userRoutes = require("./user.route");
const categoryRoutes = require("./category.route");
const productRoutes = require("./product.route");

router.use("/user", userRoutes);

router.use("/category", categoryRoutes);

router.use("/product", productRoutes);

module.exports = router;
