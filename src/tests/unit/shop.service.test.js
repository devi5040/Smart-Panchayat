// __tests__/shopService.test.js
const shopService = require('../../services/shop.service'); // adjust path if needed
const { Shops, Users, ShipmentShops } = require('../../models');
const { ConflictError, NotFoundError, BadRequestError } = require('../../utils/error');

jest.mock('../../models');

describe('Shop Service Edge Cases', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getShopIdbyUserId', () => {
    it('should throw error for invalid userId types', async () => {
      await expect(shopService.getShopIdbyUserId(null)).rejects.toThrow('User id is invalid');
      await expect(shopService.getShopIdbyUserId(undefined)).rejects.toThrow('User id is invalid');
      await expect(shopService.getShopIdbyUserId('abc')).rejects.toThrow('User id is invalid');
    });

    it('should throw NotFoundError if user does not exist', async () => {
      Users.findByPk.mockResolvedValue(null);
      await expect(shopService.getShopIdbyUserId(1)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if shop does not exist', async () => {
      Users.findByPk.mockResolvedValue({ id: 1 });
      Shops.findOne.mockResolvedValue(null);
      await expect(shopService.getShopIdbyUserId(1)).rejects.toThrow(NotFoundError);
    });

    it('should return shop if found', async () => {
      Users.findByPk.mockResolvedValue({ id: 1 });
      Shops.findOne.mockResolvedValue({ id: 10, shop_name: 'Test Shop' });
      const result = await shopService.getShopIdbyUserId(1);
      expect(result).toEqual({ id: 10, shop_name: 'Test Shop' });
    });
  });

  describe('addShop', () => {
    it('should throw ConflictError if shop array is not empty', async () => {
      Shops.findAll.mockResolvedValue([{}]);
      await expect(shopService.addShop('Shop1', '12345', 0, 0, 1)).rejects.toThrow(ConflictError);
    });

    it('should create a shop if no shop exists', async () => {
      Shops.findAll.mockResolvedValue([]);
      Shops.create.mockResolvedValue({ id: 1, shop_name: 'Shop1' });
      const result = await shopService.addShop('Shop1', '12345', 0, 0, 1);
      expect(result).toEqual({ id: 1, shop_name: 'Shop1' });
    });

    it('should handle edge case where findAll returns null or undefined', async () => {
      Shops.findAll.mockResolvedValue(null);
      Shops.create.mockResolvedValue({ id: 2, shop_name: 'Edge Shop' });
      const result = await shopService.addShop('Edge Shop', '12345', 0, 0, 2);
      expect(result).toEqual({ id: 2, shop_name: 'Edge Shop' });
    });
  });

  describe('getShops', () => {
    it('should throw error if no shops found (null)', async () => {
      Shops.findAll.mockResolvedValue(null);
      await expect(shopService.getShops()).rejects.toThrow('Shops not found');
    });

    it('should return empty array if no shops exist', async () => {
      Shops.findAll.mockResolvedValue([]);
      const result = await shopService.getShops();
      expect(result).toEqual([]);
    });

    it('should return shops if exist', async () => {
      Shops.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await shopService.getShops();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getShopDetails', () => {
    it('should throw BadRequestError for invalid shopId', async () => {
      await expect(shopService.getShopDetails(null)).rejects.toThrow(BadRequestError);
      await expect(shopService.getShopDetails('abc')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if shop does not exist', async () => {
      Shops.findByPk.mockResolvedValue(null);
      await expect(shopService.getShopDetails(1)).rejects.toThrow(NotFoundError);
    });

    it('should return shop if exists', async () => {
      Shops.findByPk.mockResolvedValue({ id: 1, shop_name: 'Shop1' });
      const result = await shopService.getShopDetails(1);
      expect(result).toEqual({ id: 1, shop_name: 'Shop1' });
    });
  });

  describe('updateShopDetails', () => {
    it('should throw NotFoundError if shop does not exist initially', async () => {
      Shops.findOne.mockResolvedValue(null);
      await expect(shopService.updateShopDetails(1, 1, 'Shop1', '12345', 0, 0)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw error if update fails (0 rows updated)', async () => {
      Shops.findOne.mockResolvedValueOnce({ id: 1 });
      Shops.update.mockResolvedValue([0]);
      await expect(shopService.updateShopDetails(1, 1, 'Shop1', '12345', 0, 0)).rejects.toThrow(
        'Shop cannot be updated',
      );
    });

    it('should throw NotFoundError if updated shop not found in second fetch', async () => {
      Shops.findOne.mockResolvedValueOnce({ id: 1 }); // initial
      Shops.update.mockResolvedValue([1]);
      Shops.findOne.mockResolvedValueOnce(null); // second fetch fails
      await expect(shopService.updateShopDetails(1, 1, 'Shop1', '12345', 0, 0)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should return updated shop if successful', async () => {
      Shops.findOne.mockResolvedValueOnce({ id: 1 }); // initial find
      Shops.update.mockResolvedValue([1]); // update returns 1 row updated
      Shops.findOne.mockResolvedValueOnce({ id: 1, shop_name: 'Updated Shop' }); // final fetch

      const result = await shopService.updateShopDetails(1, 1, 'Updated Shop', '12345', 0, 0);
      expect(result).toEqual({ id: 1, shop_name: 'Updated Shop' });
    });
  });

  describe('addRemarksToShipments', () => {
    it('should throw BadRequestError if shipmentId invalid', async () => {
      await expect(shopService.addRemarksToShipments(1, null, 'remark')).rejects.toThrow(
        BadRequestError,
      );
    });

    it('should throw NotFoundError if shipment does not exist', async () => {
      ShipmentShops.findOne.mockResolvedValue(null);
      await expect(shopService.addRemarksToShipments(1, 1, 'remark')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw error if update fails (0 rows updated)', async () => {
      ShipmentShops.findOne.mockResolvedValueOnce({ id: 1, remarks: '' });
      ShipmentShops.update.mockResolvedValue([0]);
      await expect(shopService.addRemarksToShipments(1, 1, 'remark')).rejects.toThrow(
        'No records are updated.',
      );
    });

    it('should return updated shipment if successful', async () => {
      ShipmentShops.findOne.mockResolvedValueOnce({ id: 1, remarks: '' });
      ShipmentShops.update.mockResolvedValue([1]);
      ShipmentShops.findOne.mockResolvedValueOnce({
        id: 1,
        remarks: 'remark',
      });

      const result = await shopService.addRemarksToShipments(1, 1, 'remark');
      expect(result).toEqual({ id: 1, remarks: 'remark' });
    });
  });
});
