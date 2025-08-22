const router = require("express").Router();
const userRoutes = require("./user.route");
const categoryRoutes = require("./category.route");

router.use("/user", userRoutes);

router.use("/category", categoryRoutes);

module.exports = router;
