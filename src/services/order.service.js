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
