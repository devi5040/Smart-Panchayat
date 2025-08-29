const router = require("express").Router();

const auth = require("../middleware/firebaseAuthMiddleware");

const validate = require("../middleware/validation.middleware");
const orderSchema = require("../utils/validation/order.validation");

const orderController = require("../controllers/order.controller");

router.get("/", orderController.getOrders);

router.get("/history", auth, orderController.getOrderHistory);

router.get("/:orderId", orderController.getOrderByID);

router.get(
  "/collection-centre/:collectionCentre",
  orderController.getOrdersByCollectionCentre
);

router.get(
  "/payment-status/:paymentStatus",
  validate(orderSchema.paymentStatusOrderSchema, "params"),
  orderController.getOrdersByPaymentStatus
);

router.post("/", validate(orderSchema.orderSchema), orderController.addOrder);

router.patch(
  "/:orderId",
  validate(orderSchema.paymentStatusOrderSchema),
  orderController.updateOrderPaymentStatus
);

module.exports = router;
