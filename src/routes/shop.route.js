const router = require("express").Router();

const auth = require("../middleware/firebaseAuthMiddleware");
const validation = require("../middleware/validation.middleware");

const shopController = require("../controllers/shop.controller");

const shopValidator = require("../utils/validation/shop.validation");

router.get("/", auth, shopController.getShops);

router.get("/:shopId", shopController.getShopDetails);

router.post(
  "/",
  auth,
  validation(shopValidator.productDataSchema),
  shopController.addShop
);

router.put(
  "/:shopId",
  auth,
  validation(shopValidator.productDataSchema),
  shopController.updateShopDetails
);

router.patch(
  "/shipment/:shipmentId",
  validation(shopValidator.remarksSchema),
  shopController.addRemarks
);

module.exports = router;
