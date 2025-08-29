const router = require("express").Router();

const auth = require("../middleware/firebaseAuthMiddleware");

const validate = require("../middleware/validation.middleware");
const orderSchema = require("../utils/validation/order.validation");

const orderController = require("../controllers/order.controller");

router.get("/", orderController.getOrders);

router.post("/", validate(orderSchema.orderSchema), orderController.addOrder);

router.get("/history", auth, orderController.getOrderHistory);

router.get(
  "/collection-centre/:collectionCentre",
  orderController.getOrdersByCollectionCentre
);

module.exports = router;
