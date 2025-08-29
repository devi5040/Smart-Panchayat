const sequelize = require("../config/db");
const { OrderItems, Orders, Users, Products } = require("../models");
const { NotFoundError } = require("../utils/error");

exports.addOrder = async (orderData, items) => {
  const { collectionCentre, paymentStatus = "pending", userId } = orderData;

  return await sequelize.transaction(async (t) => {
    // check if user exists
    const user = await Users.findByPk(userId, { transaction: t });
    if (!user) throw new NotFoundError("❌ User not found!");

    // create order
    const order = await Orders.create(
      {
        price: 1,
        collection_centre: collectionCentre,
        payment_status: paymentStatus,
        userId,
      },
      { transaction: t }
    );

    let totalPrice = 0;

    for (const item of items) {
      const { quantity, quality, productId } = item;

      // check if product exists or not
      const product = await Products.findByPk(productId, { transaction: t });
      if (!product) throw new NotFoundError("❌ Product not found!");

      totalPrice = product.price * quantity;

      // insert into order-items table
      await OrderItems.create(
        {
          price: product.price * quantity,
          quantity,
          product_quality: quality,
          productId,
          orderId: order.id,
        },
        { transaction: t }
      );
    }

    const [numRowsUpdated] = await Orders.update(
      { price: totalPrice },
      { where: { id: order.id }, transaction: t }
    );
    if (numRowsUpdated == 0) throw new Error("No rows updated");

    const orderData = await Orders.findByPk(order.id, {
      include: { model: Products, through: ["quantity"] },
      transaction: t,
    });
    return orderData;
  });
};

exports.getOrders = async () => {
  const order = await Orders.findAll({
    include: {
      model: Products,
      through: { attributes: ["quantity", "product_quality"] },
    },
  });
  if (!order) throw new Error("Order is undefined/null");
  return order;
};

exports.getOrderHistory = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError("User not found!");
  const orders = await Orders.findAll({
    where: { userId },
    include: {
      model: Products,
      through: { attributes: ["quantity", "product_quality"] },
    },
  });
  if (!orders) throw new Error("Order data is undefined/null");
  return orders;
};

exports.getOrderByCollectionCentre = async (collectionCentre) => {
  const order = await Orders.findAll({
    where: { collection_centre: collectionCentre },
  });
  if (order?.length == 0) throw new NotFoundError("Order not found");
  return order;
};

exports.getOrderByPaymentStatus = async (paymentStatus) => {
  const order = await Orders.findAll({
    where: {
      payment_status: paymentStatus,
    },
  });
  return order;
};

exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const order = await Orders.findByPk(orderId);
  if (!order) throw new NotFoundError("Order not found!");
  const [numRowsUpdated] = await Orders.update(
    {
      payment_status: paymentStatus,
    },
    { where: { id: orderId } }
  );
  if (numRowsUpdated == 0) throw new Error("No rows are updated!");
  const orderData = await Orders.findByPk(orderId);
  return orderData;
};
