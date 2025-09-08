const { Products, ShopProducts, Category, Shops } = require('../../models');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
  NoContentError,
} = require('../../utils/error');
const productServices = require('../../services/product.service');

jest.mock('../../models', () => ({
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
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Category: {
    findByPk: jest.fn(),
  },
  Shops: {
    findByPk: jest.fn(),
  },
}));

describe('Product Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductsByCategory', () => {
    it('should throw error if categoryId is invalid', async () => {
      await expect(productServices.getProductsByCategory(0)).rejects.toThrow(
        'Invalid categoryId. Must be a positive integer.',
      );
      await expect(productServices.getProductsByCategory('abc')).rejects.toThrow(
        'Invalid categoryId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if category not found', async () => {
      Category.findByPk.mockResolvedValue(null);
      await expect(productServices.getProductsByCategory(1)).rejects.toThrow(NotFoundError);
    });

    it('should return products for valid category', async () => {
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.findAll.mockResolvedValue([{ id: 1, name: 'P1' }]);
      const res = await productServices.getProductsByCategory(1);
      expect(res).toEqual([{ id: 1, name: 'P1' }]);
    });
  });

  describe('getAllProducts', () => {
    it('should return empty array if no products', async () => {
      Products.findAll.mockResolvedValue(null);
      const res = await productServices.getAllProducts();
      expect(res).toEqual([]);
    });

    it('should return all products', async () => {
      Products.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await productServices.getAllProducts();
      expect(res).toEqual([{ id: 1 }]);
    });
  });

  describe('getProductsForShop', () => {
    it('should throw error if shopId invalid', async () => {
      await expect(productServices.getProductsForShop(0)).rejects.toThrow(
        'Invalid shopId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if shop not found', async () => {
      Shops.findByPk.mockResolvedValue(null);
      await expect(productServices.getProductsForShop(1)).rejects.toThrow(NotFoundError);
    });

    it('should return products for shop', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      ShopProducts.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await productServices.getProductsForShop(1);
      expect(res).toEqual([{ id: 1 }]);
    });
  });

  describe('getProductsForStatus', () => {
    it('should throw error if shopId invalid', async () => {
      await expect(productServices.getProductsForStatus(null, 'active')).rejects.toThrow(
        'Invalid shopId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if shop not found', async () => {
      Shops.findByPk.mockResolvedValue(null);
      await expect(productServices.getProductsForStatus(1, 'active')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should return products for shopId and status', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      ShopProducts.findAll.mockResolvedValue([{ id: 1, status: 'active' }]);
      const res = await productServices.getProductsForStatus(1, 'active');
      expect(res).toEqual([{ id: 1, status: 'active' }]);
    });
  });

  describe('getSingleProduct', () => {
    it('should throw error if productId invalid', async () => {
      await expect(productServices.getSingleProduct(0)).rejects.toThrow(
        'Invalid productId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if product not found', async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(productServices.getSingleProduct(1)).rejects.toThrow(NotFoundError);
    });

    it('should return product if found', async () => {
      Products.findByPk.mockResolvedValue({ id: 1, name: 'P1' });
      const res = await productServices.getSingleProduct(1);
      expect(res).toEqual({ id: 1, name: 'P1' });
    });
  });

  describe('addProduct', () => {
    it('should throw error if inputs invalid', async () => {
      await expect(productServices.addProduct('', 0, null, 0)).rejects.toThrow(
        'Invalid input parameters.',
      );
    });

    it('should throw NotFoundError if category not found', async () => {
      Category.findByPk.mockResolvedValue(null);
      await expect(productServices.addProduct('P1', 100, 'img', 1)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if product exists', async () => {
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.findOne.mockResolvedValue({ id: 1 });
      await expect(productServices.addProduct('P1', 100, 'img', 1)).rejects.toThrow(ConflictError);
    });

    it('should create and return new product', async () => {
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.findOne.mockResolvedValue(null);
      Products.create.mockResolvedValue({ id: 1, name: 'P1' });
      const res = await productServices.addProduct('P1', 100, 'img', 1);
      expect(res).toEqual({ id: 1, name: 'P1' });
    });
  });

  describe('updateProduct', () => {
    it('should throw error if inputs invalid', async () => {
      await expect(productServices.updateProduct(0, 'P1', 10, 'img', 1)).rejects.toThrow(
        'Invalid input parameters.',
      );
    });

    it('should throw NotFoundError if product not found', async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(productServices.updateProduct(1, 'P1', 10, 'img', 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError if category not found', async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Category.findByPk.mockResolvedValue(null);
      await expect(productServices.updateProduct(1, 'P1', 10, 'img', 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NoContentError if update fails', async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.update.mockResolvedValue([0]);
      await expect(productServices.updateProduct(1, 'P1', 10, 'img', 1)).rejects.toThrow(
        NoContentError,
      );
    });

    it('should return updated product', async () => {
      Products.findByPk.mockResolvedValueOnce({ id: 1 });
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.update.mockResolvedValue([1]);
      Products.findByPk.mockResolvedValueOnce({ id: 1, name: 'Updated' });
      const res = await productServices.updateProduct(1, 'Updated', 100, 'img', 1);
      expect(res).toEqual({ id: 1, name: 'Updated' });
    });
  });

  describe('updateProductStatus', () => {
    it('should throw error if shopProductId invalid', async () => {
      await expect(productServices.updateProductStatus(0, 'inactive')).rejects.toThrow(
        'Invalid shopProductId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if shopProduct not found', async () => {
      ShopProducts.findByPk.mockResolvedValue(null);
      await expect(productServices.updateProductStatus(1, 'inactive')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw BadRequestError if update fails', async () => {
      ShopProducts.findByPk.mockResolvedValue({ id: 1 });
      ShopProducts.update.mockResolvedValue([0]);
      await expect(productServices.updateProductStatus(1, 'inactive')).rejects.toThrow(
        BadRequestError,
      );
    });

    it('should return updated shopProduct', async () => {
      ShopProducts.findByPk.mockResolvedValueOnce({ id: 1, status: 'active' });
      ShopProducts.update.mockResolvedValue([1]);
      ShopProducts.findByPk.mockResolvedValueOnce({ id: 1, status: 'inactive' });
      const res = await productServices.updateProductStatus(1, 'inactive');
      expect(res).toEqual({ id: 1, status: 'inactive' });
    });
  });

  describe('deleteProduct', () => {
    it('should throw error if productId invalid', async () => {
      await expect(productServices.deleteProduct('abc')).rejects.toThrow(
        'Invalid productId. Must be a positive integer.',
      );
    });

    it('should throw NotFoundError if product not found', async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(productServices.deleteProduct(1)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if delete fails', async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Products.destroy.mockResolvedValue(0);
      await expect(productServices.deleteProduct(1)).rejects.toThrow(BadRequestError);
    });

    it('should return true when deleted', async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Products.destroy.mockResolvedValue(1);
      const res = await productServices.deleteProduct(1);
      expect(res).toBe(true);
    });
  });

  describe('addProductShop', () => {
    it('should throw error if inputs invalid', async () => {
      await expect(
        productServices.addProductShop(0, 0, '', 0, null, '', '', 0, new Date()),
      ).rejects.toThrow('Invalid input parameters.');
    });

    it('should throw NotFoundError if shop not found', async () => {
      Shops.findByPk.mockResolvedValue(null);
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, null, 'P1', 'img', 1, new Date()),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if productId provided but product not found', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Products.findByPk.mockResolvedValue(null);
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, 99, null, null, null, new Date()),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if product already exists in shop', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Products.findByPk.mockResolvedValue({ id: 99 });
      ShopProducts.findOne.mockResolvedValue({ id: 1 });
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, 99, null, null, null, new Date()),
      ).rejects.toThrow(ConflictError);
    });

    it('should create shopProduct for existing productId', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Products.findByPk.mockResolvedValue({ id: 99 });
      ShopProducts.findOne.mockResolvedValue(null);
      ShopProducts.create.mockResolvedValue({ id: 1, productId: 99, shopId: 1 });
      const res = await productServices.addProductShop(
        1,
        100,
        'good',
        1,
        99,
        null,
        null,
        null,
        new Date(),
      );
      expect(res).toEqual({ id: 1, productId: 99, shopId: 1 });
    });

    it('should throw error if creating new product but missing params', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, null, null, null, null, new Date()),
      ).rejects.toThrow('Missing required parameters for new product.');
    });

    it('should throw NotFoundError if category not found when creating new product', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Category.findByPk.mockResolvedValue(null);
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, null, 'P1', 'img', 99, new Date()),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if product already exists when creating new', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.findOne.mockResolvedValue({ id: 1 });
      await expect(
        productServices.addProductShop(1, 100, 'good', 1, null, 'P1', 'img', 1, new Date()),
      ).rejects.toThrow(ConflictError);
    });

    it('should create new product and shopProduct', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1 });
      Category.findByPk.mockResolvedValue({ id: 1 });
      Products.findOne.mockResolvedValue(null);
      Products.create.mockResolvedValue({ id: 101, name: 'P1' });
      ShopProducts.create.mockResolvedValue({ id: 1, productId: 101, shopId: 1 });
      const res = await productServices.addProductShop(
        1,
        100,
        'good',
        1,
        null,
        'P1',
        'img',
        1,
        new Date(),
      );
      expect(res).toEqual({ id: 1, productId: 101, shopId: 1 });
    });
  });

  describe('updateProductPrice', () => {
    it('should throw error if inputs invalid', async () => {
      await expect(productServices.updateProductPrice(0, 0)).rejects.toThrow(
        'Invalid input parameters.',
      );
    });

    it('should throw NotFoundError if product not found', async () => {
      Products.findByPk.mockResolvedValue(null);
      await expect(productServices.updateProductPrice(1, 100)).rejects.toThrow(NotFoundError);
    });

    it('should throw NoContentError if update fails', async () => {
      Products.findByPk.mockResolvedValue({ id: 1 });
      Products.update.mockResolvedValue([0]);
      await expect(productServices.updateProductPrice(1, 100)).rejects.toThrow(NoContentError);
    });

    it('should update and return product', async () => {
      Products.findByPk.mockResolvedValueOnce({ id: 1 });
      Products.update.mockResolvedValue([1]);
      Products.findByPk.mockResolvedValueOnce({ id: 1, price: 100 });
      const res = await productServices.updateProductPrice(1, 100);
      expect(res).toEqual({ id: 1, price: 100 });
    });
  });

  describe('updateShopProducts', () => {
    it('should throw error if inputs invalid', async () => {
      await expect(productServices.updateShopProducts(0, 'good', 0, new Date(), 0)).rejects.toThrow(
        'Invalid input parameters.',
      );
    });

    it('should throw NotFoundError if shopProduct not found', async () => {
      ShopProducts.findByPk.mockResolvedValue(null);
      await expect(
        productServices.updateShopProducts(1, 'good', 100, new Date(), 1),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NoContentError if update fails', async () => {
      ShopProducts.findByPk.mockResolvedValue({ id: 1 });
      ShopProducts.update.mockResolvedValue([0]);
      await expect(
        productServices.updateShopProducts(1, 'good', 100, new Date(), 1),
      ).rejects.toThrow(NoContentError);
    });

    it('should update and return shopProduct', async () => {
      ShopProducts.findByPk.mockResolvedValueOnce({ id: 1 });
      ShopProducts.update.mockResolvedValue([1]);
      ShopProducts.findByPk.mockResolvedValueOnce({ id: 1, quantity: 10, status: 'pending' });
      const res = await productServices.updateShopProducts(10, 'good', 100, new Date(), 1);
      expect(res).toEqual({ id: 1, quantity: 10, status: 'pending' });
    });
  });
});
