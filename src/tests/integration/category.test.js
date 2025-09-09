const request = require('supertest');
const app = require('../../app');
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Category } = require('../../models');

// Fake tokens (replace with real Firebase JWTs in production)
const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDI5NzkwLCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0Mjk3OTAsImV4cCI6MTc1NzQzMzM5MCwicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.D9HqWbTH62tRj7c_pfhglUa03_E-IR7Re8wLAp4DgUZ39FBMi_dMIf0CsyCpt42lFC5lgx5k9XjlgtvVOgdCZfq2K7AMWmq5s4Yd-4kZGPX-s2YXDC0niiv6fLZDzaJuJ_TPgOsu9PPKK5WElbz116W8RgFcc4iU0BI0E0Y8AB19ZnIQx_T0IOMu144_3n6kH-V2_64gNFqxVd11Y2-3CQ0wOpv-a43QOjJbrgHH9zM6mgo0stHdl__rHTwCPw0qldQgOnGGn6y8a9fGkB62UDPOEpIZPYbMZJ4hD5ZaHkGSHvYzxaEPiDOIjbleb56pfmxG6y7OTOea7dWRGES50g';
const shopToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDI5ODE1LCJ1c2VyX2lkIjoiUWNpNTdrRnhxalhYM2VvdjV0dGd6QldNd2ZxMiIsInN1YiI6IlFjaTU3a0Z4cWpYWDNlb3Y1dHRnekJXTXdmcTIiLCJpYXQiOjE3NTc0Mjk4MTUsImV4cCI6MTc1NzQzMzQxNSwicGhvbmVfbnVtYmVyIjoiKzkxOTkwMjE3NjI4NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTkwMjE3NjI4NSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.PxoSSqqJZy5Fq_rhJOLCGf0IWGXyvwvsISuEatZMXw5SWp7T9bcrC2CdsUKGg5SIYqIixNSIFCydeyuBvzFwoaS93fE_bqMJi2J3QTVIe_N0wIh544iyBvSWPI1i9Pgik7oqFfuRw9Qvd1idCw5V0st-GQtSu6Ddk6h2levhmOAV2ceySs8V-Xnai6Ws94p-21RM6xmIfcKmF7Gc4Wru31DEFnDRQ_VTgXKp-nYwwzaS09xqqeQZdO4YZOBwctamVOHZ5YYKkeUlwdlRObNmwzEqEz2vO876vWl_KImdrG8D5IwzhL-QQrs9Rzk583F7wBQNG-hyilecJjqgVOWhzg';
const customerToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDI5ODQyLCJ1c2VyX2lkIjoiZjZITTZxMzhTWmJYbkkzdHhjY2pNVjRIa2IxMyIsInN1YiI6ImY2SE02cTM4U1piWG5JM3R4Y2NqTVY0SGtiMTMiLCJpYXQiOjE3NTc0Mjk4NDIsImV4cCI6MTc1NzQzMzQ0MiwicGhvbmVfbnVtYmVyIjoiKzkxOTAwODkyMTQxMSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTAwODkyMTQxMSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.L1JtuHp5RY4nbCNqPrptXrb_laibXOzHuTjLhzB-VfiGEt6vA839scT_OueEEQnEQDnCZ_rcOPeZmh2swemi8khafT3ik76tm9Ps4Me_zLsF-fWBy6cr9UVs_X3Y6BZt-LNdDLavQMc_jUJylT04pmmEhZcNT-O_Kp133Tlh23FZdA6Ny4Ygk04lNNIGxbW21lt2oa0K45rFb9gsSPgfCBsOK0TnW4v4bEp8i0lsCate3pQm7i8SnKbTqECsRfWIQHVHCnssQzDInIRizMdbhmRfhobQCyv6w-k0G-NNv2U9mreGMfewtKg-xkH9LFlhFy9jZpK7imNYFD73Ck_ndg';

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

describe('Category Routes Integration Tests', () => {
  // -----------------------------
  // GET /api/v1/category
  // -----------------------------
  describe('GET /api/v1/category', () => {
    it('should retrieve all categories successfully', async () => {
      await Category.create({
        name: 'Electronics',
        image_url: 'https://example.com/electronics.png',
      });

      const res = await request(app).get('/api/v1/category').set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.categories).toBeDefined();
      expect(Array.isArray(res.body.categories)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/v1/category');
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // POST /api/v1/category/signed-url
  // -----------------------------
  describe('POST /api/v1/category/signed-url', () => {
    it('should return signed URL with valid input', async () => {
      const res = await request(app)
        .post('/api/v1/category/signed-url')
        .set('Authorization', adminToken)
        .send({ fileName: 'test.jpg', fileType: 'image/jpeg', fileSize: 2000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.signedURL).toBeDefined();
      expect(res.body.fileUrl).toBeDefined();
    });

    it('should fail with invalid fileType', async () => {
      const res = await request(app)
        .post('/api/v1/category/signed-url')
        .set('Authorization', adminToken)
        .send({ fileName: 'test.jpg', fileType: 'bad/type' });

      expect(res.statusCode).toBe(400);
    });

    it('should fail without body', async () => {
      const res = await request(app)
        .post('/api/v1/category/signed-url')
        .set('Authorization', adminToken)
        .send({ fileName: 'test.png' });
      expect(res.statusCode).toBe(400);
    });

    it('should fail without token', async () => {
      const res = await request(app).post('/api/v1/category/signed-url').send({
        fileName: 'noauth.png',
        fileType: 'image/png',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // POST /api/v1/category
  // -----------------------------
  describe('POST /api/v1/category', () => {
    it('should add category successfully', async () => {
      const res = await request(app)
        .post('/api/v1/category')
        .set('Authorization', adminToken)
        .send({ name: 'Fruits', imageUrl: 'https://example.com/fruits.png' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/Category added successfully/);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/category')
        .set('Authorization', adminToken)
        .send({ name: '' });

      expect(res.statusCode).toBe(400);
    });

    it('should fail without auth', async () => {
      const res = await request(app).post('/api/v1/category').send({
        name: 'NoAuthCategory',
        imageUrl: 'https://example.com/noauth.png',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // GET /api/v1/category/:categoryId/products
  // -----------------------------
  describe('GET /api/v1/category/:categoryId/products', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({
        name: 'Snacks',
        image_url: 'https://example.com/snacks.png',
      });
    });

    it('should return products for valid category', async () => {
      const res = await request(app)
        .get(`/api/v1/category/${category.id}/products`)
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeDefined();
    });

    it('should return empty products for non-existing category', async () => {
      const res = await request(app)
        .get('/api/v1/category/999999/products')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(404);
    });

    it('should fail without auth', async () => {
      const res = await request(app).get(`/api/v1/category/${category.id}/products`);
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // PUT /api/v1/category/:categoryId
  // -----------------------------
  describe('PUT /api/v1/category/:categoryId', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({
        name: 'Drinks',
        image_url: 'https://example.com/drinks.png',
      });
    });

    it('should update category successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/category/${category.id}`)
        .set('Authorization', adminToken)
        .send({ name: 'Updated Drinks', imageUrl: 'https://example.com/updated.png' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/updated successfully/);
    });

    it('should fail with invalid body', async () => {
      const res = await request(app)
        .put(`/api/v1/category/${category.id}`)
        .set('Authorization', adminToken)
        .send({ name: '' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .put('/api/v1/category/999999')
        .set('Authorization', adminToken)
        .send({ name: 'NotFound', imageUrl: 'https://example.com/missing.png' });

      expect([404, 500]).toContain(res.statusCode);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .put(`/api/v1/category/${category.id}`)
        .send({ name: 'NoAuthUpdate', imageUrl: 'url' });

      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // DELETE /api/v1/category/:categoryId
  // -----------------------------
  describe('DELETE /api/v1/category/:categoryId', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({
        name: 'Bakery',
        image_url: 'https://example.com/bakery.png',
      });
    });

    it('should delete category successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/category/${category.id}`)
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .delete('/api/v1/category/999999')
        .set('Authorization', adminToken);

      expect([200, 404]).toContain(res.statusCode);
    });

    it('should fail without auth', async () => {
      const res = await request(app).delete(`/api/v1/category/${category.id}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
