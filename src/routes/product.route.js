const router = require("express").Router();

const authentication = require("../middleware/firebaseAuthMiddleware");

const productController = require("../controllers/product.controller");

router.get(
  "/:categoryId",
  authentication,
  productController.getAllProductsByCategory
);

router.get("/", authentication, productController.getAllProducts);

module.exports = router;
