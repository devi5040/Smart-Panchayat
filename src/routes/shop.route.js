const router = require("express").Router();

const auth = require("../middleware/firebaseAuthMiddleware");
const validation = require("../middleware/validation.middleware");

const shopController = require("../controllers/shop.controller");

const shopValidator = require("../utils/validation/shop.validation");

router.get("/", auth, shopController.getShops);

router.post(
  "/",
  auth,
  validation(shopValidator.productDataSchema),
  shopController.addShop
);

module.exports = router;
