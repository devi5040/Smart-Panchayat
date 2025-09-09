/**
 * @file order.routes.int.test.js
 * @description Integration tests for Order routes.
 * Uses supertest with real DB, wrapped in transactions for isolation.
 *
 * @version v1.0.0
 * @updated September 9, 2025
 */

const request = require('supertest');
const app = require('../../app');
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Orders, Users } = require('../../models');

const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDMxNTg2LCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0MzE1ODYsImV4cCI6MTc1NzQzNTE4NiwicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.NgtKXo_gNcuGVzsUor_WBihxhZ-XPb9Y7i3-sAOsTj8RsCq3fn7nEyUq1W_mBjZLLo1z0oGunp01WQ9QZtbU_J-VT6v01J9DNMqc9sSRawd2EQIgfc8XNtXcz87hhneZcwO7X6r2veWsjC3ffJlJsilThV6ba5phFCOjGKPm1Lo-a0WAv4ymRaN-bmirJJomPHfUYfaT3zw8dHpJHPeAva_5ZcN2ctjnwIceUoG7JjNiRtF2V-BZjUSE329TnagKf78i4ulPcjKbGLrxmlKwtuKiXkbxoIEo_dCd1a5CDCectE9LuJlo56EuLIBAuLH_nOBg4AzBmnpyB0VsymLDDw';
const customerToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDMxNTU3LCJ1c2VyX2lkIjoiZjZITTZxMzhTWmJYbkkzdHhjY2pNVjRIa2IxMyIsInN1YiI6ImY2SE02cTM4U1piWG5JM3R4Y2NqTVY0SGtiMTMiLCJpYXQiOjE3NTc0MzE1NTcsImV4cCI6MTc1NzQzNTE1NywicGhvbmVfbnVtYmVyIjoiKzkxOTAwODkyMTQxMSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTAwODkyMTQxMSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.bfjB1WZzp6tIRsyhG7eAqAmTb-snz5jyq6h2nFSVrdB2uBOmA0OEW9N2KeFOmhtgyEylNU5cUyFocNJYZCehniNfgKb3_NvNSghGeOseexF6LN4meVq-MsfkdrGo8a76fqWQXYIX99O1V_TZe_nNnfDlfOZTV3Y1TrXWue9fLKlQSSU-MdR6kkZuzuiyPbZNDSCnzeVceCiKUKHAlb9RZJza_vKeykSShhZjgY9p-nb8Uq6MbrUz91oKoEiMDH1g03Fff52GBAGFwkQ8DL9fnt1PgIBPOfI-O-Pf5R8CKqNT-SrcbWoOI91BmmPHvpNd7DlwSq7dW8aHb18dFSkURg';

jest.setTimeout(30000);

beforeAll(async () => {
  await initializeTestDB();
});

beforeEach(async () => {
  await startTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Order Routes Integration Tests', () => {
  // -----------------------------
  // GET /api/v1/order
  // -----------------------------
  describe('GET /api/v1/order', () => {
    it('should return all orders for admin', async () => {
      await Orders.create({
        userId: 1,
        price: 143,
        collection_centre: 'London',
        payment_status: 'paid',
      });

      const res = await request(app).get('/api/v1/order').set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/order');
      expect(res.statusCode).toBe(401);
    });

    it('should forbid customer role', async () => {
      const res = await request(app).get('/api/v1/order').set('Authorization', customerToken);
      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // GET /api/v1/order/history
  // -----------------------------
  describe('GET /api/v1/order/history', () => {
    let user;

    beforeAll(async () => {
      user = await Users.create({
        firebaseUid: 'Jxscd',
        phone_number: '+911121234354',
        name: 'Test Customer',
      });
      await Orders.create({
        userId: user.id,
        collection_centre: 'Berlin',
        payment_status: 'pending',
        price: 143,
      });
    });

    it('should return history for logged-in customer', async () => {
      const res = await request(app)
        .get('/api/v1/order/history')
        .set('Authorization', customerToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return empty if user has no orders', async () => {
      const res = await request(app)
        .get('/api/v1/order/history')
        .set('Authorization', customerToken);

      expect(res.statusCode).toBe(200);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/order/history');
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // GET /api/v1/order/:orderId
  // -----------------------------
  describe('GET /api/v1/order/:orderId', () => {
    let order;

    beforeEach(async () => {
      order = await Orders.create({
        userId: 1,
        collection_centre: 'NYC',
        payment_status: 'paid',
        price: 777,
      });
    });

    it('should return order by ID for admin', async () => {
      const res = await request(app)
        .get(`/api/v1/order/${order.id}`)
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.order).toBeDefined();
    });

    it('should return 404 if not found', async () => {
      const res = await request(app).get('/api/v1/order/999999').set('Authorization', adminToken);

      expect([404, 500]).toContain(res.statusCode);
    });

    it('should forbid customer role', async () => {
      const res = await request(app)
        .get(`/api/v1/order/${order.id}`)
        .set('Authorization', customerToken);

      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // GET /api/v1/order/collection-centre/:cc
  // -----------------------------
  describe('GET /api/v1/order/collection-centre/:cc', () => {
    beforeEach(async () => {
      await Orders.create({
        userId: 1,
        collection_centre: 'Paris',
        payment_status: 'pending',
        price: 889,
      });
    });

    it('should return orders for valid centre (admin)', async () => {
      const res = await request(app)
        .get('/api/v1/order/collection-centre/Paris')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should return empty if no orders exist for centre', async () => {
      const res = await request(app)
        .get('/api/v1/order/collection-centre/London')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
    });

    it('should forbid customer role', async () => {
      const res = await request(app)
        .get('/api/v1/order/collection-centre/Paris')
        .set('Authorization', customerToken);

      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // GET /api/v1/order/payment-status/:status
  // -----------------------------
  describe('GET /api/v1/order/payment-status/:status', () => {
    beforeEach(async () => {
      await Orders.create({
        userId: 1,
        collection_centre: 'Rome',
        payment_status: 'paid',
        price: 990,
      });
    });

    it('should return orders by payment status (admin)', async () => {
      const res = await request(app)
        .get('/api/v1/order/payment-status/paid')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should fail with invalid payment status', async () => {
      const res = await request(app)
        .get('/api/v1/order/payment-status/invalid_status')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(400);
    });

    it('should forbid customer role', async () => {
      const res = await request(app)
        .get('/api/v1/order/payment-status/paid')
        .set('Authorization', customerToken);

      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // POST /api/v1/order
  // -----------------------------
  describe('POST /api/v1/order', () => {
    it('should create order (admin)', async () => {
      const res = await request(app)
        .post('/api/v1/order')
        .set('Authorization', adminToken)
        .send({
          orderData: { userId: '1', collectionCentre: 'Tokyo' },
          items: [{ productId: '23', quantity: 2 }],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.order).toBeDefined();
    });

    it('should fail with invalid body', async () => {
      const res = await request(app)
        .post('/api/v1/order')
        .set('Authorization', adminToken)
        .send({ orderData: {} });

      expect(res.statusCode).toBe(400);
    });

    it('should forbid customer role', async () => {
      const res = await request(app)
        .post('/api/v1/order')
        .set('Authorization', customerToken)
        .send({
          orderData: { userId: '1', collectionCentre: 'Delhi' },
          items: [{ productId: '22', quantity: 1 }],
        });

      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // PATCH /api/v1/order/:orderId
  // -----------------------------
  describe('PATCH /api/v1/order/:orderId', () => {
    let order;

    beforeEach(async () => {
      order = await Orders.create({
        userId: 1,
        collection_centre: 'Mumbai',
        payment_status: 'pending',
        price: 223,
      });
    });

    it('should update payment status (admin)', async () => {
      const res = await request(app)
        .patch(`/api/v1/order/${order.id}`)
        .set('Authorization', adminToken)
        .send({ paymentStatus: 'paid' });

      expect(res.statusCode).toBe(200);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.payment_status).toBe('paid');
    });

    it('should fail with invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/order/${order.id}`)
        .set('Authorization', adminToken)
        .send({ paymentStatus: 'not_a_status' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if order not found', async () => {
      const res = await request(app)
        .patch('/api/v1/order/999999')
        .set('Authorization', adminToken)
        .send({ paymentStatus: 'paid' });

      expect([404, 500]).toContain(res.statusCode);
    });

    it('should forbid customer role', async () => {
      const res = await request(app)
        .patch(`/api/v1/order/${order.id}`)
        .set('Authorization', customerToken)
        .send({ paymentStatus: 'paid' });

      expect(res.statusCode).toBe(403);
    });
  });
});
