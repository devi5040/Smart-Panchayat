/**
 * @filename user.services.test.js
 * @description Unit tests for user service functions. Covers all user-related operations with success and failure cases.
 *
 * @version v1.0.1
 * @updated Sep 8, 2025
 * @author
 */

const userServices = require('../../services/user.services');
const s3 = require('../../config/aws/aws.s3.config');
const { Users } = require('../../models');
const admin = require('firebase-admin');
const { encryptPassword, comparePasswords } = require('../../utils/hashPassword');
const { NotFoundError, BadRequestError, NoContentError } = require('../../utils/error');

jest.mock('../../config/aws/aws.s3.config');
jest.mock('../../models');
jest.mock('../../utils/hashPassword');
jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

describe('User Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSignedUrlS3', () => {
    it('should return signed URL and fileUrl', async () => {
      s3.getSignedUrlPromise.mockResolvedValue('https://signed-url.com');
      const result = await userServices.getSignedUrlS3('file.png', 'image/png');
      expect(result).toHaveProperty('signedURL');
      expect(result).toHaveProperty('fileUrl');
    });

    it('should throw error if signed URL not generated', async () => {
      s3.getSignedUrlPromise.mockResolvedValue(null);
      await expect(userServices.getSignedUrlS3('file.png', 'image/png')).rejects.toThrow(
        'Could not generate signedUrl',
      );
    });
  });

  describe('addUser', () => {
    it('should update user successfully', async () => {
      Users.update.mockResolvedValue([1]);
      Users.findOne.mockResolvedValue({ id: 1, firebaseUid: 'uid123' });
      const result = await userServices.addUser({
        name: 'Test',
        firebaseUid: 'uid123',
        languagePreference: 'en',
        latitude: 10,
        longitude: 20,
        role: 'user',
      });
      expect(result).toHaveProperty('firebaseUid', 'uid123');
    });

    it('should throw NoContentError if no rows updated', async () => {
      Users.update.mockResolvedValue([0]);
      await expect(
        userServices.addUser({
          name: 'Test',
          firebaseUid: 'uid123',
          languagePreference: 'en',
          latitude: 10,
          longitude: 20,
          role: 'user',
        }),
      ).rejects.toThrow(NoContentError);
    });
  });

  describe('getUserByMobileNumber', () => {
    it('should return user by mobile number', async () => {
      Users.findOne.mockResolvedValue({ id: 1, phone_number: '123' });
      const result = await userServices.getUserByMobileNumber('123');
      expect(result).toHaveProperty('id');
    });

    it('should throw if invalid mobile number', async () => {
      await expect(userServices.getUserByMobileNumber(null)).rejects.toThrow(
        'The mobile number is invalid.',
      );
    });

    it('should throw NotFoundError if not found', async () => {
      Users.findOne.mockResolvedValue(null);
      await expect(userServices.getUserByMobileNumber('123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserByID', () => {
    it('should return user by ID', async () => {
      Users.findByPk.mockResolvedValue({ id: 1 });
      const result = await userServices.getUserByID(1);
      expect(result).toHaveProperty('id');
    });

    it('should throw error if ID invalid', async () => {
      await expect(userServices.getUserByID(null)).rejects.toThrow();
    });

    it('should throw NotFoundError if user not found', async () => {
      Users.findByPk.mockResolvedValue(null);
      await expect(userServices.getUserByID(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUserDetails', () => {
    it('should update user details', async () => {
      Users.update.mockResolvedValue([1]);
      Users.findByPk.mockResolvedValue({ id: 1, home_address: 'test' });
      const result = await userServices.updateUserDetails({ userId: 1, data: {} });
      expect(result).toHaveProperty('id');
    });

    it('should throw NoContentError if no rows updated', async () => {
      Users.update.mockResolvedValue([0]);
      await expect(userServices.updateUserDetails({ userId: 1, data: {} })).rejects.toThrow(
        NoContentError,
      );
    });
  });

  describe('setPreferredLanguage', () => {
    it('should set preferred language', async () => {
      Users.findByPk.mockResolvedValueOnce({ id: 1 }); // first find
      Users.update.mockResolvedValue([1]);
      Users.findByPk.mockResolvedValueOnce({ id: 1, language_preference: 'en' }); // second find
      const result = await userServices.setPreferredLanguage(1, 'en');
      expect(result).toHaveProperty('language_preference', 'en');
    });

    it('should throw NotFoundError if user not found', async () => {
      Users.findByPk.mockResolvedValue(null);
      await expect(userServices.setPreferredLanguage(1, 'en')).rejects.toThrow(NotFoundError);
    });

    it('should throw NoContentError if no update', async () => {
      Users.findByPk.mockResolvedValue({ id: 1 });
      Users.update.mockResolvedValue([0]);
      await expect(userServices.setPreferredLanguage(1, 'en')).rejects.toThrow(NoContentError);
    });
  });

  describe('changeUserRole', () => {
    it('should toggle role', async () => {
      Users.findByPk.mockResolvedValueOnce({ id: 1, user_role: 'user' }); // initial user
      Users.update.mockResolvedValue([1]);
      Users.findByPk.mockResolvedValueOnce({ id: 1, user_role: 'shop' });
      const result = await userServices.changeUserRole(1, 'user');
      expect(result).toHaveProperty('user_role', 'shop');
    });

    it('should return null if ID is 0', async () => {
      const result = await userServices.changeUserRole(0, 'user');
      expect(result).toBeNull();
    });

    it('should throw NotFoundError if user not found', async () => {
      Users.findByPk.mockResolvedValue(null);
      await expect(userServices.changeUserRole(1, 'user')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addPassword', () => {
    it('should add password', async () => {
      Users.findByPk
        .mockResolvedValueOnce({ id: 1 }) // initial find
        .mockResolvedValueOnce({ password: null }) // check password
        .mockResolvedValueOnce({ id: 1, user_role: 'user' }); // final fetch
      encryptPassword.mockResolvedValue('hashed');
      Users.update.mockResolvedValue([1]);
      const result = await userServices.addPassword(1, 'pass');
      expect(result).toHaveProperty('id');
    });

    it('should throw if user already has password', async () => {
      Users.findByPk.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ password: 'xxx' });
      encryptPassword.mockResolvedValue('hashed');
      await expect(userServices.addPassword(1, 'pass')).rejects.toThrow(
        'User already has a password',
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      Users.findByPk
        .mockResolvedValueOnce({ id: 1 }) // user exists
        .mockResolvedValueOnce({ password: 'old-hash' }) // fetch current password
        .mockResolvedValueOnce({ id: 1 }); // final fetch
      comparePasswords.mockResolvedValueOnce(true); // old password matches
      encryptPassword.mockResolvedValue('new-hash');
      comparePasswords.mockResolvedValueOnce(false); // new password is not same
      Users.update.mockResolvedValue([1]);
      const result = await userServices.updatePassword(1, 'old', 'new');
      expect(result).toHaveProperty('id');
    });

    it('should throw if old password incorrect', async () => {
      Users.findByPk.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ password: 'hash' });
      comparePasswords.mockResolvedValue(false);
      await expect(userServices.updatePassword(1, 'old', 'new')).rejects.toThrow(
        "The old password you entered doesn't match",
      );
    });

    it('should throw if new password same as old', async () => {
      Users.findByPk.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ password: 'hash' });
      comparePasswords
        .mockResolvedValueOnce(true) // old matches
        .mockResolvedValueOnce(true); // new matches old
      encryptPassword.mockResolvedValue('hash');
      await expect(userServices.updatePassword(1, 'old', 'old')).rejects.toThrow(
        'You cannot enter same password',
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return users', async () => {
      Users.findAll.mockResolvedValue([{ id: 1 }]);
      const result = await userServices.getAllUsers();
      expect(result).toBeInstanceOf(Array);
    });

    it('should throw if no users', async () => {
      Users.findAll.mockResolvedValue(null);
      await expect(userServices.getAllUsers()).rejects.toThrow(NotFoundError);
    });
  });

  describe('logoutUser', () => {
    it('should logout successfully', async () => {
      admin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: '123' }),
        revokeRefreshTokens: jest.fn().mockResolvedValue(true),
      });
      const result = await userServices.logoutUser('token');
      expect(result).toBe(true);
    });

    it('should throw if no token provided', async () => {
      await expect(userServices.logoutUser()).rejects.toThrow('No token provided.');
    });
  });

  describe('getUsersByStatus', () => {
    it('should return active users', async () => {
      Users.findAll.mockResolvedValue([{ id: 1, account_status: 'active' }]);
      const result = await userServices.getUsersByStatus('active');
      expect(result[0]).toHaveProperty('account_status', 'active');
    });

    it('should throw if status invalid', async () => {
      await expect(userServices.getUsersByStatus('wrong')).rejects.toThrow(BadRequestError);
    });
  });

  describe('getUserByRole', () => {
    it('should return users by role', async () => {
      Users.findAll.mockResolvedValue([{ id: 1, user_role: 'user' }]);
      const result = await userServices.getUserByRole('user');
      expect(result[0]).toHaveProperty('user_role', 'user');
    });

    it('should throw if invalid role', async () => {
      await expect(userServices.getUserByRole('fake')).rejects.toThrow(BadRequestError);
    });
  });

  describe('verifyUser', () => {
    it('should return existing user', async () => {
      Users.findOne.mockResolvedValue({ id: 1, firebaseUid: 'uid' });
      const result = await userServices.verifyUser({ uid: 'uid', phone_number: '123' });
      expect(result).toHaveProperty('firebaseUid', 'uid');
    });

    it('should create new user if not found', async () => {
      Users.findOne.mockResolvedValue(null);
      Users.create.mockResolvedValue({ id: 2, firebaseUid: 'new-uid' });
      const result = await userServices.verifyUser({ uid: 'new-uid', phone_number: '456' });
      expect(result).toHaveProperty('firebaseUid', 'new-uid');
    });
  });
});
