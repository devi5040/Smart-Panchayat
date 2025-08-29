const orderService = require("../../services/order.service");
const { Orders, OrderItems, Users, Products } = require("../../models");
const sequelize = require("../../config/db");
const { NotFoundError } = require("../../utils/error");

// Mock Sequelize transaction
jest.mock("../../config/db", () => ({
  transaction: jest.fn(),
}));

// Mock models
jest.mock("../../models", () => ({
  Orders: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
  OrderItems: {
    create: jest.fn(),
  },
  Users: {
    findByPk: jest.fn(),
  },
  Products: {
    findByPk: jest.fn(),
  },
}));

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addOrder", () => {
    it("should create a new order successfully", async () => {
      const mockUser = { id: 1 };
      const mockProduct = { id: 1, price: 100 };
      const orderData = { collectionCentre: "Centre A", userId: 1 };
      const items = [{ productId: 1, quantity: 2, quality: "A" }];

      Users.findByPk.mockResolvedValue(mockUser);
      Products.findByPk.mockResolvedValue(mockProduct);
      Orders.create.mockResolvedValue({ id: 1 });
      OrderItems.create.mockResolvedValue({});
      Orders.update.mockResolvedValue([1]);
      Orders.findByPk.mockResolvedValue({
        id: 1,
        collection_centre: "Centre A",
        userId: 1,
        Products: [
          {
            id: 1,
            OrderItems: { quantity: 2, product_quality: "A" },
          },
        ],
      });

      sequelize.transaction.mockImplementation(async (cb) => cb());

      const result = await orderService.addOrder(orderData, items);

      expect(result).toHaveProperty("id", 1);
      expect(result.Products[0].OrderItems.quantity).toBe(2);
    });

    it("should throw NotFoundError if user not found", async () => {
      Users.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockImplementation(async (cb) => cb());

      await expect(
        orderService.addOrder({ collectionCentre: "Centre A", userId: 1 }, [])
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if product not found", async () => {
      const mockUser = { id: 1 };
      Users.findByPk.mockResolvedValue(mockUser);
      Products.findByPk.mockResolvedValue(null);

      sequelize.transaction.mockImplementation(async (cb) => cb());

      await expect(
        orderService.addOrder({ collectionCentre: "Centre A", userId: 1 }, [
          { productId: 1, quantity: 1, quality: "A" },
        ])
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getOrders", () => {
    it("should return all orders", async () => {
      const mockOrders = [{ id: 1 }];
      Orders.findAll.mockResolvedValue(mockOrders);

      const result = await orderService.getOrders();

      expect(result).toEqual(mockOrders);
      expect(Orders.findAll).toHaveBeenCalledTimes(1);
    });

    it("should throw error if orders undefined/null", async () => {
      Orders.findAll.mockResolvedValue(null);

      await expect(orderService.getOrders()).rejects.toThrow(
        "Order is undefined/null"
      );
    });
  });

  describe("getOrderHistory", () => {
    it("should return orders for a user", async () => {
      const mockUser = { id: 1 };
      Users.findByPk.mockResolvedValue(mockUser);
      Orders.findAll.mockResolvedValue([{ id: 1 }]);

      const result = await orderService.getOrderHistory(1);
      expect(result).toEqual([{ id: 1 }]);
    });

    it("should throw NotFoundError if user not found", async () => {
      Users.findByPk.mockResolvedValue(null);
      await expect(orderService.getOrderHistory(1)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status successfully", async () => {
      const mockOrder = { id: 1 };
      Orders.findByPk.mockResolvedValue(mockOrder);
      Orders.update.mockResolvedValue([1]);
      Orders.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.updatePaymentStatus(1, "paid");
      expect(result).toEqual(mockOrder);
    });

    it("should throw NotFoundError if order not found", async () => {
      Orders.findByPk.mockResolvedValue(null);
      await expect(orderService.updatePaymentStatus(1, "paid")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getOrderById", () => {
    it("should return an order by ID", async () => {
      const mockOrder = { id: 1 };
      Orders.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(1);
      expect(result).toEqual(mockOrder);
    });

    it("should throw NotFoundError if order not found", async () => {
      Orders.findByPk.mockResolvedValue(null);
      await expect(orderService.getOrderById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe("getOrderByCollectionCentre", () => {
    it("should return orders for a collection centre", async () => {
      Orders.findAll.mockResolvedValue([{ id: 1 }]);
      const result = await orderService.getOrderByCollectionCentre("Centre A");
      expect(result).toEqual([{ id: 1 }]);
    });

    it("should throw NotFoundError if no orders found", async () => {
      Orders.findAll.mockResolvedValue([]);
      await expect(
        orderService.getOrderByCollectionCentre("Centre A")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getOrderByPaymentStatus", () => {
    it("should return orders with specific payment status", async () => {
      Orders.findAll.mockResolvedValue([{ id: 1 }]);
      const result = await orderService.getOrderByPaymentStatus("paid");
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
