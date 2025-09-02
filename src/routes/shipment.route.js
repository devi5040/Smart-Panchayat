const router = require("express").Router();

const shipmentController = require("../controllers/shipment.controller");

router.get("/", shipmentController.getShipmentList);

module.exports = router;
