const request = require('supertest');
const app = require('../../app'); // Your Express app
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Shops } = require('../../models');

// Fake tokens with roles (replace with real JWTs in practice)
const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDE2NTA5LCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0MTY1MDksImV4cCI6MTc1NzQyMDEwOSwicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.jT_9MiLRI4IlErXptb-8PyvuZpxcU84FDl4Sd-r9LhszPOlHXOssJoL809p-uFcHiCWTes6fffENlrrRzkjnuf6CX1bTlgqYWop2HKt88Wh-9lwiRvbTcb1hMrnbXn5UO6_FfJw_QgAXd8y_TYNc8s_rk7MrV1cYcGRDb_L4UDkjvPpaNclzUpQHfHX2dEJbNSX87-Lak37nDikjwE_-6rZlJpP0ZzTv3TudF2N98xZZYSV4j-DB5CLbTscIC0NaynxwfxA-m4p3kCo7D9nfqN4fs8C2boPr9vQfqp4VyOYwg5kYG2NSCSfS6J-pEnWM9USV1Ujwykk3rp_M-u-a1Q';
const shopToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDE1MzUzLCJ1c2VyX2lkIjoiUWNpNTdrRnhxalhYM2VvdjV0dGd6QldNd2ZxMiIsInN1YiI6IlFjaTU3a0Z4cWpYWDNlb3Y1dHRnekJXTXdmcTIiLCJpYXQiOjE3NTc0MTUzNTMsImV4cCI6MTc1NzQxODk1MywicGhvbmVfbnVtYmVyIjoiKzkxOTkwMjE3NjI4NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTkwMjE3NjI4NSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.p1_DAzo_6XcjIc0By6C8DeRUFr6bWJN5C_rS2lH2YboIcnktRG97vhBiZo4MM81c8GCafLgub6yxxtIM90X-DJ0MZ8bkj74D7k3wie3zwAqPgMMYbD2kez-i6wXyOnfkQUrFPRXpYWotO94y8zOWfPutr15hUKaySUgie1xtQaqXBh_EDi9_1VzGx2csiwh8pvQgoRjr-R7PzaFqrrRyRn5xk3xlOzsZDZKei2cyv1Q5UPPc6lCTjW7MzAP3c_sAO4oego2dK_Ti1jEJHcaErzhQDbyHbpALTBBUToE35Q4shav2MSFBB6woIV5VhGmEtE6hkLexnixdIujv10NGNQ';
const customerToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDE3NjMwLCJ1c2VyX2lkIjoiZjZITTZxMzhTWmJYbkkzdHhjY2pNVjRIa2IxMyIsInN1YiI6ImY2SE02cTM4U1piWG5JM3R4Y2NqTVY0SGtiMTMiLCJpYXQiOjE3NTc0MTc2MzAsImV4cCI6MTc1NzQyMTIzMCwicGhvbmVfbnVtYmVyIjoiKzkxOTAwODkyMTQxMSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTAwODkyMTQxMSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.hJK0WwDQ9yxWGAB_4sgVdBJ87D4LaVsQwCnh8fp9k6QwvhQsNPoaTFALxzbRUmuodgCrv5-tPjs6yzkuFOZuZbZyUppmzcWHFDPNaHwotL0lHypRIJbh1zLzeIngHg28VCQTHjMU_QcwOVyffutfiyVNC0cslmyWl59NBKaBYuqP3P-fZa7ayevyQRNyfSBYg62YvMOfjkEGD705Dr0uTK1-hQYECuhv6akeBdbL9In_SXY5gOCuyuMR0WHNTPdfwoB0PJJDxe15bBRSKd9QJIJGUQUGQeUi1wThEUy4p0alBjFL3jL0KfuUkIQr9iX3AxBKfIHno7gUHbltUEbYAg';

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

describe('Shop Routes Integration Tests', () => {
  // -----------------------------
  // GET /api/v1/shop
  // -----------------------------
  describe('GET /api/v1/shop', () => {
    it('should allow admin role', async () => {
      await Shops.create({
        shop_name: 'Admin Shop',
        pin_code: 560001,
        latitude: 12.97,
        longitude: 77.59,
        userId: 1,
      });
      const res = await request(app).get('/api/v1/shop').set('Authorization', adminToken);
      expect(res.statusCode).toBe(200);
      expect(res.body.shops).toBeDefined();
    });
    it('should forbid shop role', async () => {
      const res = await request(app).get('/api/v1/shop').set('Authorization', shopToken);
      expect(res.statusCode).toBe(403);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/shop');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // GET /api/v1/shop/:shopId
  // -----------------------------
  describe('GET /api/v1/shop/:shopId', () => {
    it('should allow shop role to fetch shop details', async () => {
      const shop = await Shops.create({
        shop_name: 'Detail Shop',
        pin_code: 123456,
        latitude: 10,
        longitude: 20,
        userId: 34,
      });
      const res = await request(app).get(`/api/v1/shop/${shop.id}`).set('Authorization', shopToken);
      expect(res.statusCode).toBe(200);
    });
    it('should forbid admin role', async () => {
      const shop = await Shops.create({
        shop_name: 'Forbidden Shop',
        pin_code: 222222,
        latitude: 1,
        longitude: 2,
        userId: 1,
      });
      const res = await request(app)
        .get(`/api/v1/shop/${shop.id}`)
        .set('Authorization', adminToken);
      expect(res.statusCode).toBe(403);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/shop/1');
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent shopId', async () => {
      const res = await request(app).get('/api/v1/shop/999999').set('Authorization', shopToken);
      expect(res.statusCode).toBe(404);
    });
  });
  // -----------------------------
  // POST /api/v1/shop
  // -----------------------------
  describe('POST /api/v1/shop', () => {
    it('should create a shop with valid data', async () => {
      const res = await request(app).post('/api/v1/shop').set('Authorization', shopToken).send({
        name: 'New Shop',
        pinCode: '400001',
        latitude: 19.076,
        longitude: 72.8777,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.shop).toBeDefined();
    });
    it('should fail validation with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/shop')
        .set('Authorization', shopToken)
        .send({ name: 'Incomplete Shop' });
      expect(res.statusCode).toBe(400);
    });
    it('should fail if unauthorized', async () => {
      const res = await request(app).post('/api/v1/shop').send({
        name: 'No Auth Shop',
        pin_code: 500000,
        latitude: 10,
        longitude: 20,
      });
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // PUT /api/v1/shop/:shopId
  // -----------------------------
  describe('PUT /api/v1/shop/:shopId', () => {
    it('should allow admin to update shop details', async () => {
      const shop = await Shops.create({
        shop_name: 'Old Shop',
        pin_code: 400002,
        latitude: 15,
        longitude: 30,
        userId: 1,
      });
      const res = await request(app)
        .put(`/api/v1/shop/${shop.id}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Updated Shop',
          pinCode: '560078',
          latitude: 13,
          longitude: 77,
        });
      expect(res.statusCode).toBe(200);
    });
    it('should allow shop role to update shop details', async () => {
      const shop = await Shops.create({
        shop_name: 'Shop User Store',
        pin_code: 111111,
        latitude: 0,
        longitude: 0,
        userId: 34,
      });
      const res = await request(app)
        .put(`/api/v1/shop/${shop.id}`)
        .set('Authorization', shopToken)
        .send({
          name: 'Shop Updated',
          pinCode: '222222',
          latitude: 1,
          longitude: 1,
        });
      expect(res.statusCode).toBe(200);
    });
    it('should forbid customer role', async () => {
      const shop = await Shops.create({
        shop_name: 'Forbidden Update Shop',
        pin_code: 333333,
        latitude: 1,
        longitude: 1,
        userId: 35,
      });
      const res = await request(app)
        .put(`/api/v1/shop/${shop.id}`)
        .set('Authorization', customerToken)
        .send({
          name: 'Hack Update',
          pinCode: '444444',
          latitude: 2,
          longitude: 2,
        });
      expect(res.statusCode).toBe(403);
    });
    it('should return 404 for non-existent shopId', async () => {
      const res = await request(app)
        .put('/api/v1/shop/999999')
        .set('Authorization', adminToken)
        .send({
          name: 'Not Found Shop',
          pinCode: '500000',
          latitude: 1,
          longitude: 1,
        });
      expect(res.statusCode).toBe(404);
    });
    it('should fail validation if fields are missing', async () => {
      const shop = await Shops.create({
        shop_name: 'Bad Update Shop',
        pin_code: '888888',
        latitude: 0,
        longitude: 0,
        userId: 35,
      });
      const res = await request(app)
        .put(`/api/v1/shop/${shop.id}`)
        .set('Authorization', adminToken)
        .send({ name: '' }); // invalid schema
      expect(res.statusCode).toBe(400);
    });
    it('should fail if no token provided', async () => {
      const shop = await Shops.create({
        shop_name: 'No Token Update Shop',
        pin_code: '777777',
        latitude: 42.5252,
        longitude: 49,
        userId: 35,
      });
      const res = await request(app).put(`/api/v1/shop/${shop.id}`).send({
        name: 'Update Fail',
        pinCode: '123123',
        latitude: 2,
        longitude: 2,
      });
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // PATCH /api/v1/shop/shipment/:shipmentId
  // -----------------------------
  describe('PATCH /api/v1/shop/shipment/:shipmentId', () => {
    it('should allow shop role to add remarks', async () => {
      const res = await request(app)
        .patch('/api/v1/shop/shipment/1')
        .set('Authorization', shopToken)
        .send({ remarks: 'Delivered successfully', shopId: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Remarks added/);
    });
    it('should forbid admin role', async () => {
      const res = await request(app)
        .patch('/api/v1/shop/shipment/1')
        .set('Authorization', adminToken)
        .send({ remarks: 'Invalid action', shopId: 1 });
      expect(res.statusCode).toBe(403);
    });
    it('should fail validation when remarks field is missing', async () => {
      const res = await request(app)
        .patch('/api/v1/shop/shipment/1')
        .set('Authorization', shopToken)
        .send({ shopId: 1 });
      expect(res.statusCode).toBe(400);
    });
    it('should fail if no token provided', async () => {
      const res = await request(app)
        .patch('/api/v1/shop/shipment/1')
        .send({ remarks: 'No token case', shopId: 1 });
      expect(res.statusCode).toBe(401);
    });
    it('should return custom error if service fails with statusCode', async () => {
      const res = await request(app)
        .patch('/api/v1/shop/shipment/9999')
        .set('Authorization', shopToken)
        .send({ remarks: 'Bad Shipment', shopId: 1 });
      expect([400, 404, 500]).toContain(res.statusCode);
    });
  });
});
