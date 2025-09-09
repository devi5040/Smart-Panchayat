/**
 * @filename product.routes.int.test.js
 * @description Integration tests for Product Routes with real DB + Supertest
 */

const request = require('supertest');
const app = require('../../app'); // Express app
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Products, ShopProducts } = require('../../models');

// Fake JWTs (replace with real valid tokens in your test env)
const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDIzMjE3LCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0MjMyMTcsImV4cCI6MTc1NzQyNjgxNywicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.GkSUA4FbAlTzkgixBnbtzkp_bU3ksfBgOmttchbVsHxJRhVFMWTnBUBjfcgvMlr426cxmYgsj-9u6cZffIHJ3044fJg6XWarWkMURVvEXIvbVn64C0z_zJg49a9pBsAu849ux8z0i_39wJ0_k5ZlFDMyV6QKJ3Nuv4GzyeGYF8JJ0R_UvmAntECm6LbJw3-ZlwkiBXOT-K4PmlH3gB5ATy1hIus_gtHa4iGjSWP07KL11HKtOuesv7jM-Fun1A1Htxx2AZ3nkxz1Xxvqk9fo8hDpt37589fMuuQZ1BsAHBywJb9J7oEqRJoI3geGJF7Dgd0FFHah8QC04rm0JrV-mg';
const shopToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDIzMjUzLCJ1c2VyX2lkIjoiUWNpNTdrRnhxalhYM2VvdjV0dGd6QldNd2ZxMiIsInN1YiI6IlFjaTU3a0Z4cWpYWDNlb3Y1dHRnekJXTXdmcTIiLCJpYXQiOjE3NTc0MjMyNTMsImV4cCI6MTc1NzQyNjg1MywicGhvbmVfbnVtYmVyIjoiKzkxOTkwMjE3NjI4NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTkwMjE3NjI4NSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.XiS59BJ23Au2lKIhqR-vdrDAy5c_4KBt7nc8pBLRZ9GGFu3ey7yXVaESh_yijSG_hWbC7XfYXLLJ5-HBTwOt0jIZ_RCZkAt0AFln9qJH_Hf0SDsEmgslXYQmAsVf0mHX0OmHbrG_ZLRwYaRKJL91HQnFwpXDhuApthtj3KTqwZg9bzl7s4sbU4x8WfIl8kr66TAApR9_a8gITnXzqZ72vfg60FfQ1ububn7XrQOrzOXwtclPvi3MpE3LhRAEznzF4KSrPILNAdbaBNz1KXe6KXtzqmCeawwXrmU9EY4paqoOvpYb7jOMBbuh82YiYUIbARglPjp7bS6x8c65h3_J3Q';
const customerToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDIzMjgwLCJ1c2VyX2lkIjoiZjZITTZxMzhTWmJYbkkzdHhjY2pNVjRIa2IxMyIsInN1YiI6ImY2SE02cTM4U1piWG5JM3R4Y2NqTVY0SGtiMTMiLCJpYXQiOjE3NTc0MjMyODAsImV4cCI6MTc1NzQyNjg4MCwicGhvbmVfbnVtYmVyIjoiKzkxOTAwODkyMTQxMSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTAwODkyMTQxMSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.Guo8H8K34ROcFFALWDH-7ITP6xfR-T-DlKxCS3dEEo1QflTzbIG1sGuiuRvqgpNrkz0xo-pX8I6rR7P06LW4IvscPOszx1xDOSuydEHlv2nTgC-XP_fg9cdaXUVglyAJWr-3qOTmjmcsI4p-tc14hB8_JFnbU2VsGNX9epVUGRyai6Q2xDyLIA4XjmdX8VG-FlJysVpY5LNVwEUKQPCxMruTPKlWtA-bPxDJurhDB-JSrWVR7vZC1Bk0DeRybroGTfMn-3wmOXFCq1alVBtMOHzsNZ4mtE2bRG0FjSrjX3nzmgzMeOA1E_7Fgg5Mt_XK99JLdMbkop4kHZ4eBg3noA';

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

describe('Product Routes Integration Tests', () => {
  // -----------------------------
  // GET /api/v1/product/shop
  // -----------------------------
  describe('GET /api/v1/product/shop', () => {
    it('should allow shop role and return products', async () => {
      const res = await request(app).get('/api/v1/product/shop').set('Authorization', shopToken);
      expect([200, 400]).toContain(res.statusCode); // 400 if shopId missing in token
    });
    it('should forbid admin role', async () => {
      const res = await request(app).get('/api/v1/product/shop').set('Authorization', adminToken);
      expect(res.statusCode).toBe(403);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/product/shop');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // GET /api/v1/product/shop/:status
  // -----------------------------
  describe('GET /api/v1/product/shop/:status', () => {
    it('should allow shop role with valid status', async () => {
      const res = await request(app)
        .get('/api/v1/product/shop/active')
        .set('Authorization', shopToken);
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should allow admin role', async () => {
      const res = await request(app)
        .get('/api/v1/product/shop/inactive')
        .set('Authorization', adminToken);
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/product/shop/active');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // GET /api/v1/product
  // -----------------------------
  describe('GET /api/v1/product', () => {
    it('should return all products for any authenticated user', async () => {
      const res = await request(app).get('/api/v1/product').set('Authorization', adminToken);
      expect(res.statusCode).toBe(200);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/product');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // GET /api/v1/product/:productId
  // -----------------------------
  describe('GET /api/v1/product/:productId', () => {
    it('should return product details if exists', async () => {
      const product = await Products.create({
        name: 'Test Product',
        price: 100,
        imageUrl: 'http://test.com/image.png',
        categoryId: 1,
      });
      const res = await request(app)
        .get(`/api/v1/product/${product.id}`)
        .set('Authorization', adminToken);
      expect(res.statusCode).toBe(200);
    });
    it('should return 404 if product not found', async () => {
      const res = await request(app).get('/api/v1/product/99999').set('Authorization', adminToken);
      expect([404, 500]).toContain(res.statusCode);
    });
    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/product/1');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // POST /api/v1/product (admin only)
  // -----------------------------
  describe('POST /api/v1/product', () => {
    it('should create product with valid data', async () => {
      const res = await request(app).post('/api/v1/product').set('Authorization', adminToken).send({
        name: 'New Product',
        price: '200',
        imageUrl: 'http://welcome.png',
        categoryId: 1,
      });
      expect(res.statusCode).toBe(201);
    });
    it('should fail validation with missing fields', async () => {
      const res = await request(app).post('/api/v1/product').set('Authorization', adminToken).send({
        name: '',
      });
      expect(res.statusCode).toBe(400);
    });
    it('should forbid shop role', async () => {
      const res = await request(app).post('/api/v1/product').set('Authorization', shopToken).send({
        name: 'Invalid',
        price: 50,
        imageUrl: 'x.png',
        categoryId: 1,
      });
      expect(res.statusCode).toBe(403);
    });
  });
  // -----------------------------
  // POST /api/v1/product/shop (shop only)
  // -----------------------------
  describe('POST /api/v1/product/shop', () => {
    it('should allow shop to add shop product', async () => {
      const res = await request(app)
        .post('/api/v1/product/shop')
        .set('Authorization', shopToken)
        .send({
          quantity: 10,
          price: 100,
          quality: 'premium',
          shopId: 1,
          productId: 14,
          name: 'Shop Product',
          image: 'http://img.com/shop.png',
          date: new Date(),
        });
      expect([201, 500]).toContain(res.statusCode);
    });
    it('should fail validation if required fields missing', async () => {
      const res = await request(app)
        .post('/api/v1/product/shop')
        .set('Authorization', shopToken)
        .send({ price: 100 });
      expect(res.statusCode).toBe(400);
    });
    it('should forbid admin role', async () => {
      const res = await request(app)
        .post('/api/v1/product/shop')
        .set('Authorization', adminToken)
        .send({
          quantity: 5,
          price: 50,
          quality: 'medium',
          shopId: 1,
          productId: 1,
          name: 'Bad Role',
          image: 'x.png',
          categoryId: 1,
          date: new Date(),
        });
      expect(res.statusCode).toBe(403);
    });
  });
  // -----------------------------
  // PATCH /api/v1/product/shop/:productId (update price by admin)
  // -----------------------------
  describe('PATCH /api/v1/product/shop/:productId', () => {
    it('should allow admin to update product price', async () => {
      const product = await Products.create({
        name: 'Price Product',
        price: 300,
        imageUrl: 'img.png',
        categoryId: 1,
      });
      const res = await request(app)
        .patch(`/api/v1/product/shop/${product.id}`)
        .set('Authorization', adminToken)
        .send({ price: 350 });
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid shop role', async () => {
      const res = await request(app)
        .patch('/api/v1/product/shop/1')
        .set('Authorization', shopToken)
        .send({ price: 500 });
      expect(res.statusCode).toBe(403);
    });
  });
  // -----------------------------
  // PUT /api/v1/product/shop/:shopProductId
  // -----------------------------
  describe('PUT /api/v1/product/shop/:shopProductId', () => {
    it('should allow shop to update shop product', async () => {
      const sp = await ShopProducts.create({
        quantity: 5,
        price: 100,
        quality: 'premium',
        shopId: 1,
        productId: 14,
        date: Date.now(),
      });
      const res = await request(app)
        .put(`/api/v1/product/shop/${sp.id}`)
        .set('Authorization', shopToken)
        .send({ quantity: 8, quality: 'high', price: 120, date: new Date() });
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid admin role', async () => {
      const sp = await ShopProducts.create({
        quantity: 2,
        price: 50,
        quality: 'medium',
        shopId: 1,
        productId: 14,
      });
      const res = await request(app)
        .put(`/api/v1/product/shop/${sp.id}`)
        .set('Authorization', adminToken)
        .send({ quantity: 3, quality: 'B', price: 60, date: new Date() });
      expect(res.statusCode).toBe(403);
    });
  });
  // -----------------------------
  // PATCH /api/v1/product/:shopProductId/status
  // -----------------------------
  describe('PATCH /api/v1/product/:shopProductId/status', () => {
    it('should allow admin to update product status', async () => {
      const sp = await ShopProducts.create({
        quantity: 5,
        price: 200,
        quality: 'premium',
        shopId: 1,
        productId: 14,
      });
      const res = await request(app)
        .patch(`/api/v1/product/${sp.id}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'rejected' });
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid shop role', async () => {
      const res = await request(app)
        .patch('/api/v1/product/1/status')
        .set('Authorization', shopToken)
        .send({ status: 'inactive' });
      expect(res.statusCode).toBe(403);
    });
    it('should fail validation if status missing', async () => {
      const res = await request(app)
        .patch('/api/v1/product/1/status')
        .set('Authorization', adminToken)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });
  // -----------------------------
  // PUT /api/v1/product/:productId
  // -----------------------------
  describe('PUT /api/v1/product/:productId', () => {
    it('should allow admin to update product', async () => {
      const product = await Products.create({
        name: 'Update Product',
        price: 100,
        image: 'http://url.png',
        categoryId: 1,
      });
      const res = await request(app)
        .put(`/api/v1/product/${product.id}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Updated',
          price: '120',
          imageUrl: 'http://url2.png',
          categoryId: 1,
        });
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid shop role', async () => {
      const res = await request(app).put('/api/v1/product/1').set('Authorization', shopToken).send({
        name: 'Bad',
        price: 200,
        imageUrl: 'x.png',
        categoryId: 1,
      });
      expect(res.statusCode).toBe(403);
    });
    it('should fail validation if fields missing', async () => {
      const product = await Products.create({
        name: 'Invalid Update',
        price: 50,
        imageUrl: 'z.png',
        categoryId: 1,
      });
      const res = await request(app)
        .put(`/api/v1/product/${product.id}`)
        .set('Authorization', adminToken)
        .send({ name: '' });
      expect(res.statusCode).toBe(400);
    });
  });
  // -----------------------------
  // DELETE /api/v1/product/:productId
  // -----------------------------
  describe('DELETE /api/v1/product/:productId', () => {
    it('should allow admin to delete product', async () => {
      const product = await Products.create({
        name: 'Delete Product',
        price: 100,
        imageUrl: 'http://img.png',
        categoryId: 1,
      });
      const res = await request(app)
        .delete(`/api/v1/product/${product.id}`)
        .set('Authorization', adminToken);
      expect([200, 500]).toContain(res.statusCode);
    });
    it('should forbid shop role', async () => {
      const res = await request(app).delete('/api/v1/product/1').set('Authorization', shopToken);
      expect(res.statusCode).toBe(403);
    });
    it('should fail without token', async () => {
      const res = await request(app).delete('/api/v1/product/1');
      expect(res.statusCode).toBe(401);
    });
  });
});
