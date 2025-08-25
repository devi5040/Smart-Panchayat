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
  "/shop/:status",
  authentication,
  authorization(["shop", "admin"]),
  productController.getProductForStatus
);

router.get("/", authentication, productController.getAllProducts);

router.get("/:productId", authentication, productController.getProductDetails);

module.exports = router;
