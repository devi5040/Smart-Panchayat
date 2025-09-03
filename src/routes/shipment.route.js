const router = require("express").Router();

const validate = require("../middleware/validation.middleware");
const schema = require("../utils/validation/shipment.validation");

const shipmentController = require("../controllers/shipment.controller");

router.get("/", shipmentController.getShipmentList);

router.post(
  "/",
  validate(schema.shipmentSchema),
  shipmentController.createShipment
);

router.put(
  "/",
  validate(schema.addShopToShipmentSchema),
  shipmentController.addShopToShipment
);

router.get("/shop/:shopId", shipmentController.getShipmentForShops);

module.exports = router;
