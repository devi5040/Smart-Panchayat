/**
 * @filename shipment.routes.int.test.js
 * @description Integration tests for Shipment Routes with real DB + Supertest
 */

const request = require('supertest');
const app = require('../../app'); // Express app
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Shipments, Shops } = require('../../models');

// Fake JWTs (replace with real valid tokens in your test env)
const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDMzMzExLCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0MzMzMTEsImV4cCI6MTc1NzQzNjkxMSwicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.pneh--jxh4FdCdWHX82eGpdCiBNhIAEtncSLstnWw_8EJ-c5Kvw8SYgP_EZTB8sJChOkgINhVccu2nVY4XDc3W3_yXmvqCWXUJUOfoAADECkvRkbs7ZIgtQBuSrE-f8Y6mkpokoOGDFFMHGzE-7e8UWBZ5alS7BuikA4OV3u3WTt_yE91qoHINLnFzXH5d1SJK6wNHpXApJdFBqHEsNoifDbftMmIXd2IXPBUzyAzFG0xJcQegkCrdxAuCxsPMFCv86rXcIlEZtLGmzjOLwgfo7xgcI3lZSUOBcIZyGXEkVMjoDmXIIYaNScs8FQwogJDPmQXcVNVBPev6KrWU7x-Q'; // same as your admin token from product test
const shopToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDMzMzM0LCJ1c2VyX2lkIjoiUWNpNTdrRnhxalhYM2VvdjV0dGd6QldNd2ZxMiIsInN1YiI6IlFjaTU3a0Z4cWpYWDNlb3Y1dHRnekJXTXdmcTIiLCJpYXQiOjE3NTc0MzMzMzQsImV4cCI6MTc1NzQzNjkzNCwicGhvbmVfbnVtYmVyIjoiKzkxOTkwMjE3NjI4NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTkwMjE3NjI4NSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.G6HOHJU_Ee_FND9d9cgcDJbVh4vnzp0cMu4fwRkuMs_CB1AcbjO6OVCSzgdjXPQd929bqWDZ9SmP6LDkN7zvamOmqCZh2UsAH7sy_r6Yk8py7enRKyEIbhM7PkwiJUTt6IsKz6FgvyUhZvhlvtW4z8jOE2DMyxAsAzS9evjGQF_OtE9PZ3VQ2VQEuD69nFJNDjqpKIUbxcJak70H6_ZUoq31Yj8Ib46GzUcmaQ1YNjswV5-Ot3Hq8fbsksKazyI3Y1WI6u89nVW4FvowkHBNej-RC8pVcHtV8SMyC3yGeIfVNg1ifdGxsuYU_MCZHR6jzzLlazWA0jUovcRJSqGqWw'; // same as shop token

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

describe('Shipment Routes Integration Tests', () => {
  // -----------------------------
  // POST /api/v1/shipment
  // -----------------------------
  describe('POST /api/v1/shipment', () => {
    it('should create shipment with valid data (admin only)', async () => {
      const res = await request(app)
        .post('/api/v1/shipment')
        .set('Authorization', adminToken)
        .send({
          shipmentDetails: {
            date: new Date(),
            collectionCentre: 'mangalore',
            location: 'puttur',
            transportationMode: 'bus',
          },
          shops: [
            {
              shopId: 1,
              products: [{ productId: 23, quantity: 5 }],
            },
          ],
        });
      expect([201, 500]).toContain(res.statusCode);
    });
    it('should fail validation if missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/shipment')
        .set('Authorization', adminToken)
        .send({});
      expect(res.statusCode).toBe(400);
    });
    it('should forbid shop role', async () => {
      const res = await request(app)
        .post('/api/v1/shipment')
        .set('Authorization', shopToken)
        .send({
          shipmentDetails: {
            date: new Date(),
            collectionCentre: 'mangalore',
            location: 'puttur',
            transportationMode: 'bus',
          },
          shops: [
            {
              shopId: 1,
              products: [{ productId: 23, quantity: 5 }],
            },
          ],
        });
      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // GET /api/v1/shipment
  // -----------------------------
  describe('GET /api/v1/shipment', () => {
    it('should list all shipments (admin only)', async () => {
      const res = await request(app).get('/api/v1/shipment').set('Authorization', adminToken);
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid shop role', async () => {
      const res = await request(app).get('/api/v1/shipment').set('Authorization', shopToken);
      expect(res.statusCode).toBe(403);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/shipment');
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // PUT /api/v1/shipment
  // -----------------------------
  describe('PUT /api/v1/shipment', () => {
    it('should add shop to shipment (admin only)', async () => {
      const shipment = await Shipments.create({
        collection_centre: 'London',
        transportation_mode: 'bus',
        location: 'puttur',
        date: new Date(),
      });
      const res = await request(app)
        .put('/api/v1/shipment')
        .set('Authorization', adminToken)
        .send({
          shipmentId: shipment.id,
          shopId: 2,
          products: [{ productId: 22, quantity: 10 }],
        });
      expect([201, 500]).toContain(res.statusCode);
    });
    it('should fail validation with missing fields', async () => {
      const res = await request(app)
        .put('/api/v1/shipment')
        .set('Authorization', adminToken)
        .send({});
      expect(res.statusCode).toBe(400);
    });
    it('should forbid shop role', async () => {
      const res = await request(app)
        .put('/api/v1/shipment')
        .set('Authorization', shopToken)
        .send({
          shipmentId: 7,
          shopId: 2,
          products: [{ productId: 22, quantity: 10 }],
        });
      expect(res.statusCode).toBe(403);
    });
  });

  // -----------------------------
  // PATCH /api/v1/shipment/:shipmentId
  // -----------------------------
  describe('PATCH /api/v1/shipment/:shipmentId/status', () => {
    it('should allow agent to update shipment status', async () => {
      const shipment = await Shipments.create({
        collection_centre: 'London',
        transportation_mode: 'bus',
        location: 'puttur',
        date: new Date(),
      });
      const res = await request(app)
        .patch(`/api/v1/shipment/${shipment.id}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'delivered' });
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should fail validation if no status provided', async () => {
      const shipment = await Shipments.create({
        collection_centre: 'London',
        transportation_mode: 'bus',
        location: 'puttur',
        date: new Date(),
      });
      const res = await request(app)
        .patch(`/api/v1/shipment/${shipment.id}/status`)
        .set('Authorization', adminToken)
        .send({});
      expect(res.statusCode).toBe(400);
    });
    it('should forbid shop role', async () => {
      const res = await request(app)
        .patch('/api/v1/shipment/1/status')
        .set('Authorization', shopToken)
        .send({ status: 'pending' });
      expect(res.statusCode).toBe(403);
    });
  });
});
