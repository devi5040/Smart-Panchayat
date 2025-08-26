const { Products, ShopProducts, Category } = require("../../models");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require("../../utils/error");
const productServices = require("../../services/product.service");

jest.mock("../../models", () => ({
  Products: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
  },
  ShopProducts: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
  Category: {
    findByPk: jest.fn(),
  },
}));

describe("Product Services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProductsByCategory", () => {
    it("should throw an error if categoryId is invalid", async () => {
      await expect(productServices.getProductsByCategory(0)).rejects.toThrow(
        "Category id is invalid."
      );
      await expect(
        productServices.getProductsByCategory(undefined)
      ).rejects.toThrow("Category id is invalid.");
      await expect(productServices.getProductsByCategory(null)).rejects.toThrow(
        "Category id is invalid."
      );
      await expect(
        productServices.getProductsByCategory("abc")
      ).rejects.toThrow("Category id is invalid.");
    });

    it("should throw NotFoundError if category is not found", async () => {
      Products.findAll.mockResolvedValue([]);
      Category.findByPk.mockResolvedValue(null);
      await expect(() =>
        productServices.getProductsByCategory(1)
      ).rejects.toThrow(NotFoundError);
    });

    it("should return products for a valid categoryId", async () => {
      const mockProducts = [{ id: 1, name: "Product 1" }];
      const mockCategory = { id: 1, name: "Category 1" };
      Products.findAll.mockResolvedValue(mockProducts);
      Category.findByPk.mockResolvedValue(mockCategory);
      const products = await productServices.getProductsByCategory(1);
      expect(products).toEqual(mockProducts);
    });
  });

  describe("getAllProducts", () => {
    it("should return all products", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1" },
        { id: 2, name: "Product 2" },
      ];
      Products.findAll.mockResolvedValue(mockProducts);
      const products = await productServices.getAllProducts();
      expect(products).toEqual(mockProducts);
    });
  });

  describe("getProductsForShop", () => {
    it("should return products for a given shopId", async () => {
      const mockShopProducts = [{ id: 1, shopId: 1, productId: 1 }];
      ShopProducts.findAll.mockResolvedValue(mockShopProducts);
      const products = await productServices.getProductsForShop(1);
      expect(products).toEqual(mockShopProducts);
    });
  });

  describe("getProductsForStatus", () => {
    it("should return products for a given shopId and status", async () => {
      const mockShopProducts = [{ id: 1, shopId: 1, status: "active" }];
      ShopProducts.findAll.mockResolvedValue(mockShopProducts);
      const products = await productServices.getProductsForStatus(1, "active");
      expect(products).toEqual(mockShopProducts);
    });
  });

  describe("getSingleProduct", () => {
    it("should throw NotFoundError if product not found", async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(() => productServices.getSingleProduct(1)).rejects.toThrow(
        NotFoundError
      );
    });
    it("should return a single product", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      Products.findByPk.mockResolvedValue(mockProduct);
      const product = await productServices.getSingleProduct(1);
      expect(product).toEqual(mockProduct);
    });
  });

  describe("addProduct", () => {
    it("should throw ConflictError if product already exists", async () => {
      Products.findOne.mockResolvedValue({ id: 1, name: "Product 1" });
      await expect(() =>
        productServices.addProduct("Product 1", 10, "image.jpg", 1)
      ).rejects.toThrow(ConflictError);
    });
    it("should add a new product", async () => {
      Products.findOne.mockResolvedValue(null);
      Products.create.mockResolvedValue({ id: 1, name: "Product 1" });
      const product = await productServices.addProduct(
        "Product 1",
        10,
        "image.jpg",
        1
      );
      expect(product).toEqual({ id: 1, name: "Product 1" });
    });
  });

  describe("updateProduct", () => {
    it("should throw NotFoundError if product not found", async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(() =>
        productServices.updateProduct(1, "Product 1", 10, "image.jpg", 1)
      ).rejects.toThrow(NotFoundError);
    });
    it("should throw BadRequestError if product is not updated", async () => {
      Products.findByPk.mockResolvedValue({ id: 1, name: "Product 1" });
      Products.update.mockResolvedValue([0]);
      await expect(() =>
        productServices.updateProduct(1, "Product 1", 10, "image.jpg", 1)
      ).rejects.toThrow(BadRequestError);
    });
    it("should update an existing product", async () => {
      Products.findByPk.mockResolvedValueOnce({ id: 1, name: "Product 1" });
      Products.update.mockResolvedValueOnce([1]);
      Products.findByPk.mockResolvedValueOnce({
        id: 1,
        name: "Updated Product 1",
      });
      const updatedProduct = await productServices.updateProduct(
        1,
        "Updated Product 1",
        20,
        "updatedImage.jpg",
        2
      );
      expect(updatedProduct).toEqual({ id: 1, name: "Updated Product 1" });
    });
  });

  describe("updateProductStatus", () => {
    it("should throw NotFoundError if product not found", async () => {
      ShopProducts.findByPk.mockResolvedValue(null);
      await expect(() =>
        productServices.updateProductStatus(1, "inactive")
      ).rejects.toThrow(NotFoundError);
    });
    it("should throw BadRequestError if product status is not updated", async () => {
      ShopProducts.findByPk.mockResolvedValue({ id: 1, status: "active" });
      ShopProducts.update.mockResolvedValue([0]);
      await expect(() =>
        productServices.updateProductStatus(1, "inactive")
      ).rejects.toThrow(BadRequestError);
    });
    it("should update product status", async () => {
      ShopProducts.findByPk.mockResolvedValueOnce({ id: 1, status: "active" });
      ShopProducts.update.mockResolvedValueOnce([1]);
      ShopProducts.findByPk.mockResolvedValueOnce({
        id: 1,
        status: "inactive",
      });
      const updatedProduct = await productServices.updateProductStatus(
        1,
        "inactive"
      );
      expect(updatedProduct).toEqual({ id: 1, status: "inactive" });
    });
  });

  describe("deleteProduct", () => {
    it("should throw an error if productId is invalid", async () => {
      await expect(() => productServices.deleteProduct(null)).rejects.toThrow(
        "Product ID is invalid"
      );
      await expect(() =>
        productServices.deleteProduct(undefined)
      ).rejects.toThrow("Product ID is invalid");
      await expect(() => productServices.deleteProduct("abc")).rejects.toThrow(
        "Product ID is invalid"
      );
    });

    it("should throw NotFoundError if product not found", async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(() => productServices.deleteProduct(1)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw BadRequestError if product is not deleted", async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Products.destroy.mockResolvedValue(0);
      await expect(() => productServices.deleteProduct(1)).rejects.toThrow(
        BadRequestError
      );
    });

    it("should delete a product", async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Products.destroy.mockResolvedValue(1);
      const result = await productServices.deleteProduct(1);
      expect(result).toEqual(true);
    });
  });
});
