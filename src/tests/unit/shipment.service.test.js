/**
 * @file shipment.service.test.js
 * @description Unit tests for shipment.service.js using Jest.
 */

const sequelize = require('../../config/db');
const { Shipments, ShipmentShops, ShipmentShopProducts, Shops, Products } = require('../../models');
const { ConflictError, NotFoundError, NoContentError } = require('../../utils/error');
const shipmentService = require('../../services/shipment.service');

// mock sequelize.transaction wrapper
sequelize.transaction = jest.fn((fn) => fn({}));

jest.mock('../../models', () => ({
  Shipments: { findAll: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
  ShipmentShops: { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
  ShipmentShopProducts: {
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
  Shops: { findByPk: jest.fn() },
  Products: { findByPk: jest.fn(), findAll: jest.fn() },
}));

describe('Shipment Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getShipmentList', () => {
    it('should return formatted shipment data', async () => {
      Shipments.findAll.mockResolvedValue([
        {
          id: 1,
          date: '2025-09-08',
          location: 'Bangalore',
          collection_centre: 'CC1',
          transportation_mode: 'Truck',
          shops: [{ 'shipment-shops': { status: 'pending' } }],
        },
      ]);

      const result = await shipmentService.getShipmentList();
      expect(result).toEqual([
        {
          id: 1,
          collectionCentre: 'CC1',
          mode: 'Truck',
          date: '2025-09-08',
          location: 'Bangalore',
          status: 'pending',
        },
      ]);
    });

    it('should return empty array when no shipments found', async () => {
      Shipments.findAll.mockResolvedValue(null);
      const result = await shipmentService.getShipmentList();
      expect(result).toEqual([]);
    });
  });

  describe('createShipment', () => {
    it('should create a new shipment successfully', async () => {
      Shipments.findAll
        .mockResolvedValueOnce([]) // no existing shipment
        .mockResolvedValueOnce([{ id: 1 }]); // final return

      Shipments.create.mockResolvedValue({ id: 1 });
      Shops.findByPk.mockResolvedValue({ id: 10 });
      ShipmentShops.create.mockResolvedValue({ id: 100 });
      Products.findByPk.mockResolvedValue({ id: 50 });
      ShipmentShopProducts.create.mockResolvedValue({ id: 500 });

      const shipmentDetails = {
        date: '2025-09-08',
        location: 'Mumbai',
        collectionCentre: 'CC2',
        transportationMode: 'Air',
      };
      const shops = [{ shopId: 10, products: [{ productId: 50, quantity: 5 }] }];

      const result = await shipmentService.createShipment(shipmentDetails, shops);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should throw ConflictError if shipment already exists', async () => {
      Shipments.findAll.mockResolvedValue([{ id: 1 }]);

      await expect(
        shipmentService.createShipment(
          { date: '2025', location: 'X', collectionCentre: 'Y', transportationMode: 'Z' },
          [],
        ),
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError if shop not found', async () => {
      Shipments.findAll.mockResolvedValue([]);
      Shipments.create.mockResolvedValue({ id: 1 });
      Shops.findByPk.mockResolvedValue(null);

      await expect(
        shipmentService.createShipment(
          { date: '2025', location: 'X', collectionCentre: 'Y', transportationMode: 'Z' },
          [{ shopId: 999, products: [] }],
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateShipmentProduct', () => {
    it('should update existing product quantity', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      Products.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue({ id: 200 });
      ShipmentShopProducts.findOne.mockResolvedValue({ id: 300 });
      ShipmentShopProducts.update.mockResolvedValue([1]);
      ShipmentShopProducts.findOne.mockResolvedValue({ id: 300, quantity: 10 });

      const result = await shipmentService.updateShipmentProduct(1, 2, 3, 10);
      expect(result).toEqual({ id: 300, quantity: 10 });
    });

    it('should insert product if not exists', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      Products.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue({ id: 200 });
      ShipmentShopProducts.findOne.mockResolvedValueOnce(null);
      ShipmentShopProducts.create.mockResolvedValue({ id: 301 });
      ShipmentShopProducts.findOne.mockResolvedValueOnce({ id: 301, quantity: 15 });

      const result = await shipmentService.updateShipmentProduct(1, 2, 3, 15);
      expect(result).toEqual({ id: 301, quantity: 15 });
    });
  });

  describe('addShopsToShipments', () => {
    it('should add a new shop with products', async () => {
      Shops.findByPk.mockResolvedValue({});
      Shipments.findByPk.mockResolvedValue({});
      ShipmentShops.findAll.mockResolvedValue([]);
      ShipmentShops.create.mockResolvedValue({ id: 100 });
      Products.findByPk.mockResolvedValue({});
      ShipmentShopProducts.create.mockResolvedValue({ id: 999 });
      Shipments.findByPk.mockResolvedValue({ id: 1, shops: [] });

      const result = await shipmentService.addShopsToShipments(1, 2, [
        { productId: 3, quantity: 4 },
      ]);
      expect(result).toEqual({ id: 1, shops: [] });
    });

    it('should throw ConflictError if shop already exists in shipment', async () => {
      Shops.findByPk.mockResolvedValue({});
      Shipments.findByPk.mockResolvedValue({});
      ShipmentShops.findAll.mockResolvedValue([{}]);

      await expect(shipmentService.addShopsToShipments(1, 2, [])).rejects.toThrow(ConflictError);
    });
  });

  describe('getShipmentForShop', () => {
    it('should return products for a shop', async () => {
      Shops.findByPk.mockResolvedValue({});
      Products.findAll.mockResolvedValue([
        {
          id: 1,
          name: 'ProductA',
          price: 100,
          'shipment-shops': [{ id: 50, status: 'delivered' }],
        },
      ]);

      const result = await shipmentService.getShipmentForShop(10);
      expect(result).toEqual([
        { id: 1, name: 'ProductA', price: 100, shipmentShopId: 50, status: 'delivered' },
      ]);
    });

    it('should throw NotFoundError if shop does not exist', async () => {
      Shops.findByPk.mockResolvedValue(null);
      await expect(shipmentService.getShipmentForShop(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getShipmentsByStatus', () => {
    it('should return shipments filtered by status', async () => {
      Shipments.findAll.mockResolvedValue([
        {
          id: 1,
          location: 'Goa',
          collection_centre: 'CC3',
          transportation_mode: 'Train',
          shops: [{ 'shipment-shops': { status: 'pending' } }],
        },
      ]);

      const result = await shipmentService.getShipmentsByStatus('pending');
      expect(result).toEqual([
        { id: 1, location: 'Goa', mode: 'Train', collectionCentre: 'CC3', status: 'pending' },
      ]);
    });
  });

  describe('getShipmentsByMode', () => {
    it('should return shipments filtered by mode', async () => {
      Shipments.findAll.mockResolvedValue([
        {
          id: 2,
          date: '2025-09-08',
          collection_centre: 'CC4',
          transportation_mode: 'Ship',
          shops: [{ 'shipment-shops': { status: 'in-progress' } }],
        },
      ]);

      const result = await shipmentService.getShipmentsByMode('Ship');
      expect(result).toEqual([
        { id: 2, date: '2025-09-08', mode: 'Ship', collectionCentre: 'CC4', status: 'in-progress' },
      ]);
    });
  });

  describe('removeProductFromShipment', () => {
    it('should remove product successfully', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      Products.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue({ id: 123 });
      ShipmentShopProducts.destroy.mockResolvedValue(1);
      ShipmentShopProducts.findOne.mockResolvedValue(null);

      const result = await shipmentService.removeProductFromShipment(1, 2, 3);
      expect(result).toBeNull();
    });

    it('should throw NoContentError if nothing deleted', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      Products.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue({ id: 123 });
      ShipmentShopProducts.destroy.mockResolvedValue(0);

      await expect(shipmentService.removeProductFromShipment(1, 2, 3)).rejects.toThrow(
        NoContentError,
      );
    });
  });

  describe('removeShopFromShipment', () => {
    it('should remove shop successfully', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue({ id: 123 });
      ShipmentShops.destroy.mockResolvedValue(1);
      ShipmentShops.findAll.mockResolvedValue([{ id: 200 }]);

      const result = await shipmentService.removeShopFromShipment(1, 2);
      expect(result).toEqual([{ id: 200 }]);
    });

    it('should throw NotFoundError if shop not found in shipment', async () => {
      Shipments.findByPk.mockResolvedValue({});
      Shops.findByPk.mockResolvedValue({});
      ShipmentShops.findOne.mockResolvedValue(null);

      await expect(shipmentService.removeShopFromShipment(1, 2)).rejects.toThrow(NotFoundError);
    });
  });
});
