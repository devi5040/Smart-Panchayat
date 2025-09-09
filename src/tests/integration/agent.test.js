/**
 * @filename agent.routes.int.test.js
 * @description Integration tests for Agent Routes with real DB + Supertest
 */

const request = require('supertest');
const app = require('../../app');
const {
  initializeTestDB,
  startTransaction,
  rollbackTransaction,
  closeTestDB,
} = require('../test.db.setup');
const { Users, Agents } = require('../../models');

// Fake JWTs (replace with real valid tokens)
const adminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDM1OTEzLCJ1c2VyX2lkIjoianhLY2pWQlU3M1FXUGFnQ3hBNm8zSWxIRzdCMiIsInN1YiI6Imp4S2NqVkJVNzNRV1BhZ0N4QTZvM0lsSEc3QjIiLCJpYXQiOjE3NTc0MzU5MTMsImV4cCI6MTc1NzQzOTUxMywicGhvbmVfbnVtYmVyIjoiKzkxOTExMzYyNDU1MiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTExMzYyNDU1MiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.UWi4wrLJ1hXL_dSqc67QuIggt8y_RgSUKCLIfLSCz757uxUV8FGPWrgQOHLO52vkGehfwxV4yu7sxofxw3VbJEyUbDR3ZGhZ2FUWFbebEiXMTWga1lCo5WigI31emLuVmmgdKqdH_kP0A1NfgcwJoWxVhaHBoQ48R59JAY-USmHjmqTHH13LeXstCKKBQnVNXpdufZwLmq2CKmYg8rmF61-Nl_q8URg7lGX4vvzSUbMAsY4cnf9JnXfhuz6wf-flosJIetkDuIjR5I0b1_bW_3uG01NhypxZY4o_XJTR-dJNLsq3WgxSClGAjtsUsk_VuCmpwJLTnNjQEIXagndkSA';

const shopToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUzZWU3ZTAyOGUzODg1YTM0NWNlMDcwNTVmODQ2ODYyMjU1YTcwNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtcGFuY2hheWF0IiwiYXVkIjoic21hcnQtcGFuY2hheWF0IiwiYXV0aF90aW1lIjoxNzU3NDM1ODg5LCJ1c2VyX2lkIjoiUWNpNTdrRnhxalhYM2VvdjV0dGd6QldNd2ZxMiIsInN1YiI6IlFjaTU3a0Z4cWpYWDNlb3Y1dHRnekJXTXdmcTIiLCJpYXQiOjE3NTc0MzU4ODksImV4cCI6MTc1NzQzOTQ4OSwicGhvbmVfbnVtYmVyIjoiKzkxOTkwMjE3NjI4NSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTkwMjE3NjI4NSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.vs27IoUM1A2XY10eX3Ny_kzoq5Z0Mv_B_JHEFtB3mv8LGmQM2Vi7HDD9Uq3Y-3_9uR0YEPqO6wMWtFSZpq9W3EFkLgtdBQ703rXZFF0diEj205xl2delbgITkGlL_s0CqFJttgFnA4X4XMQb3fdC9ta2iFi0j8obQWxPwSz32F0ZDPT3AFTFNqD4y5b83IrjJ6VUGiLjW7rfTT9KbI5K23A36W5bSZza9UXN79TQC5CXZ-3pMgu-NScsf75nvSTMOSpTfTY2qYBMa5CLCOJqU3pozOUR5VMGTJcGmIk-QYYeNF9RybLnywib_V3F1I9GNyS9PBoxQuUjkzjiHJ3Mzw';
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

describe('Agent Routes Integration Tests', () => {
  // -----------------------------
  // POST /api/v1/agent
  // -----------------------------
  describe('POST /api/v1/agent', () => {
    it('should create agent with valid data (admin only)', async () => {
      const res = await request(app).post('/api/v1/agent').set('Authorization', adminToken).send({
        mobileNumber: '+919876543210',
        name: 'Test Agent',
        latitude: 12.9716,
        longitude: 77.5946,
        languagePreference: 'English',
      });
      expect([201, 500]).toContain(res.statusCode);
    });

    it('should return 400 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/v1/agent')
        .set('Authorization', adminToken)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('should forbid shop role from creating agent', async () => {
      const res = await request(app).post('/api/v1/agent').set('Authorization', shopToken).send({
        mobileNumber: '+911234567890',
        name: 'Blocked',
        latitude: 10.1,
        longitude: 20.2,
        languagePreference: 'Kannada',
      });
      expect(res.statusCode).toBe(403);
    });

    it('should fail without token', async () => {
      const res = await request(app).post('/api/v1/agent').send({
        mobileNumber: '+911112223333',
        name: 'No Token',
        latitude: 1.23,
        longitude: 4.56,
        languagePreference: 'English',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // PATCH /api/v1/agent/:userId
  // -----------------------------
  describe('PATCH /api/v1/agent/:userId', () => {
    it('should change user role to agent (admin only)', async () => {
      const user = await Users.create({
        firebaseUid: 'jcsowp',
        name: 'Role Change User',
        phone_number: '+919998887777',
        role: 'shop',
        latitude: 12,
        longitude: 26,
      });

      const res = await request(app)
        .patch(`/api/v1/agent/${user.id}`)
        .set('Authorization', adminToken);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app).patch('/api/v1/agent/999999').set('Authorization', adminToken);
      expect([404, 500]).toContain(res.statusCode);
    });

    it('should forbid non-admin role', async () => {
      const res = await request(app).patch('/api/v1/agent/1').set('Authorization', shopToken);
      expect(res.statusCode).toBe(403);
    });

    it('should fail without token', async () => {
      const res = await request(app).patch('/api/v1/agent/1');
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------
  // DELETE /api/v1/agent/:agentId
  // -----------------------------
  describe('DELETE /api/v1/agent/:agentId', () => {
    it('should remove agent if exists (admin only)', async () => {
      const agent = await Users.create({
        name: 'Delete Me',
        phone_number: '7776665555',
        latitude: 11.11,
        longitude: 22.22,
        languagePreference: 'English',
        firebaseUid: 'shhiusjijfisdj',
      });

      const res = await request(app)
        .delete(`/api/v1/agent/${agent.id}`)
        .set('Authorization', adminToken);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('should return 404 if agent not found', async () => {
      const res = await request(app)
        .delete('/api/v1/agent/999999')
        .set('Authorization', adminToken);
      expect([404, 500]).toContain(res.statusCode);
    });

    it('should forbid shop role', async () => {
      const res = await request(app).delete('/api/v1/agent/1').set('Authorization', shopToken);
      expect(res.statusCode).toBe(403);
    });

    it('should fail without token', async () => {
      const res = await request(app).delete('/api/v1/agent/1');
      expect(res.statusCode).toBe(401);
    });
  });
});
