const router = require("express").Router();

const validate = require("../middleware/validation.middleware");
const orderSchema = require("../utils/validation/order.validation");

const orderController = require("../controllers/order.controller");

router.get("/", orderController.getOrders);

router.post("/", validate(orderSchema.orderSchema), orderController.addOrder);

module.exports = router;
