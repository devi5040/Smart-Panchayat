/**
 * @file user.routes.test.js
 * @description Jest integration tests for user routes with test DB and transaction rollback.
 * @version v1.0.0
 * @created 30-08-2025
 * @author Deviprasad
 */

const request = require('supertest');
const app = require('../../app'); // your main Express app
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Users } = require('../../models');

const authToken =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3MzM2NzA1LCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTczMzY3MDUsImV4cCI6MTc1NzM0MDMwNSwicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.Jn90arptnJ16SJQRdMukb_CuM2lt0sgP2qmksEFuzlKFNMLCYEHgW7WEgWRTON6QHRAxi0RKbk3Nh4QQpVWaDkdpwcp3WRsniFi_prHXuD5xUKffmz9iu_AEKAtJqPjbOsMKChPRgecTBKzfOFYMAFK7xfnbO6vMDJXWFwkcoo1Lju203d1S_-Sescm953AFKfqAHI-B3RKl5Emu6Ubt0xrtDlfPrEqoV49l5AkufL8Zvqxhi0gqR74wxamXO-k8yXYYeX0FB_8PdrXfU6cklaveuMvUylox_BnEeyUzHRPPOjkEnlkPAwFhC8aCFoTSlOKY28u7l7CmTnYyMHFDFQ';

jest.setTimeout(30000); // for async operations

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

describe('Users Routes Integration Tests', () => {
  // -----------------------------
  // POST /api/v1/user
  // -----------------------------
  describe('POST /api/v1/user', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          languagePreference: 'English',
          latitude: 12.9716,
          longitude: 77.5946,
        });
      expect(res.statusCode).toBe(201);
    });
    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Incomplete User' });
      expect(res.statusCode).toBe(400);
    });
  });
  // -----------------------------
  // GET /api/v1/user/:userId
  // -----------------------------
  describe('GET /api/v1/user/:userId', () => {
    it('should fetch a user by valid ID', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-2',
        name: 'Fetch User',
        phone_number: '9876543210',
        languagePreference: 'en',
        latitude: 10,
        longitude: 20,
        role: 'user',
      });
      const res = await request(app)
        .get(`/api/v1/user/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
    it('should return 404 for non-existent ID', async () => {
      const res = await request(app)
        .get('/api/v1/user/99999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(404);
    });
  });
  // -----------------------------
  // PATCH /api/v1/user/update-profile/:userId
  // -----------------------------
  describe('PATCH /api/v1/user/update-profile/:userId', () => {
    it('should update user profile successfully', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-3',
        name: 'Update User',
        phone_number: '+9111222333',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
      });
      const res = await request(app)
        .put(`/api/v1/user/update-profile/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ home: 'Updated home' });
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // PATCH /api/v1/user/language-change
  // -----------------------------
  describe('PATCH /api/v1/user/language-change', () => {
    it('should update language preference successfully', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-4',
        name: 'Lang User',
        phone_number: '1111111111',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
      });
      const res = await request(app)
        .patch('/api/v1/user/language-change')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ preferredLanguage: 'Kannada' });
      expect(res.statusCode).toBe(200);
    });
    it('should fail if language field is missing', async () => {
      const res = await request(app)
        .patch('/api/v1/user/language-change')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });
  // -----------------------------
  // PATCH /api/v1/user/change-role
  // -----------------------------
  describe('PATCH /api/v1/user/change-role', () => {
    it('should change user role successfully', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-5',
        name: 'Role User',
        phone_number: '+91222333444',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
      });
      const res = await request(app)
        .patch('/api/v1/user/change-role')
        .send({ role: 'admin' })
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // PATCH /api/v1/user/add-password
  // -----------------------------
  describe('PATCH /api/v1/user/add-password', () => {
    it('should add password successfully', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-6',
        name: 'Pass User',
        phone_number: '+91333444555',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
      });
      const res = await request(app)
        .patch('/api/v1/user/add-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Devi@5040' });
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // PATCH /api/v1/user/update-password
  // -----------------------------
  describe('PATCH /api/v1/user/update-password', () => {
    it('should update password successfully', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-7',
        name: 'UpdatePass User',
        phone_number: '+91444555666',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
        password: 'oldhashedpassword',
      });
      const res = await request(app)
        .patch('/api/v1/user/update-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'Devi@5040', newPassword: 'Hello@2025' });
      expect(res.statusCode).toBe(200);
    });
    it('should fail if old password is incorrect', async () => {
      const user = await Users.create({
        firebaseUid: 'uid-8',
        name: 'WrongPass User',
        phone_number: '+91555666777',
        languagePreference: 'en',
        latitude: 0,
        longitude: 0,
        role: 'user',
        password: 'Devi@5040',
      });
      const res = await request(app)
        .patch('/api/v1/user/update-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'Hello@5040', newPassword: 'Hello@2025' });
      expect(res.statusCode).toBe(500);
    });
  });
  // -----------------------------
  // GET /api/v1/user
  // -----------------------------
  describe('GET /api/v1/user', () => {
    it('should fetch all users', async () => {
      await Users.bulkCreate([
        {
          firebaseUid: 'u1',
          name: 'User1',
          phone_number: '+919113546738',
          languagePreference: 'English',
          latitude: 1,
          longitude: 1,
          role: 'user',
        },
        {
          firebaseUid: 'u2',
          name: 'User2',
          phone_number: '+913243564738',
          languagePreference: 'Kannada',
          latitude: 2,
          longitude: 2,
          role: 'user',
        },
      ]);
      const res = await request(app)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // GET /api/v1/user/status/:status
  // -----------------------------
  describe('GET /api/v1/user/status/:status', () => {
    it('should fetch users by status', async () => {
      const res = await request(app).get('/api/v1/user/status/active');
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // GET /api/v1/user/role/:role
  // -----------------------------
  describe('GET /api/v1/user/role/:role', () => {
    it('should fetch users by role', async () => {
      const res = await request(app)
        .get('/api/v1/user/role/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  });
  // -----------------------------
  // POST /api/v1/user/logout
  // -----------------------------
  describe('POST /api/v1/user/logout', () => {
    it('should logout user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/user/logout')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
    it('should fail if token is missing', async () => {
      const res = await request(app).post('/api/v1/user/logout');
      expect(res.statusCode).toBe(401);
    });
  });
  // -----------------------------
  // POST /api/v1/user/signed-url
  // -----------------------------
  describe('POST /api/v1/user/signed-url', () => {
    it('should return signed URL', async () => {
      const res = await request(app)
        .post('/api/v1/user/signed-url')
        .send({ fileName: 'test.png', fileType: 'image/png', fileSize: 2000 });
      expect(res.statusCode).toBe(200);
    });
    it('should fail for missing fields', async () => {
      const res = await request(app).post('/api/v1/user/signed-url').send({});
      expect(res.statusCode).toBe(400);
    });
  });
});
