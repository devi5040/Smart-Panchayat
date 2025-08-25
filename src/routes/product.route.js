const router = require("express").Router();

const authentication = require("../middleware/firebaseAuthMiddleware");
const authorization = require("../middleware/authorization.middleware");

const productController = require("../controllers/product.controller");

router.get(
  "/shop",
  authentication,
  authorization(["shop"]),
  productController.getProductForShops
);

router.get(
  "/:categoryId",
  authentication,
  productController.getAllProductsByCategory
);

router.get("/", authentication, productController.getAllProducts);

module.exports = router;
