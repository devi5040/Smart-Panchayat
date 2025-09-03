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

router.patch(
  "/:shipmentId",
  validate(schema.shipmentProductUpdateSchema),
  shipmentController.updateShipmentProduct
);

router.put(
  "/",
  validate(schema.addShopToShipmentSchema),
  shipmentController.addShopToShipment
);

router.get("/shop/:shopId", shipmentController.getShipmentForShops);

router.get(
  "/status/:status",
  validate(schema.shipmentStatus, "params"),
  shipmentController.getShipmentByStatus
);

router.get(
  "/mode/:mode",
  validate(schema.shipmentModeSchema, "params"),
  shipmentController.getShipmentByTransportationMode
);

router.delete(
  "/:shipmentId/shop/:shopId/product/:productId",
  shipmentController.removeShipmentProduct
);

module.exports = router;
