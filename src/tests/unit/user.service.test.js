/**
 * @filename user.services.test.js
 * @description This file contains unit tests for the user service functions.  It thoroughly tests various user-related operations, including
 * user creation, retrieval (by ID and mobile number), details updates, password management (adding, updating), role changes, language
 * preference updates, and user logout.  Each test case covers successful execution and error handling for robust validation.
 *
 * @version v1.0.0
 * @updated Aug 21, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const userServices = require("../../services/user.services");
const s3 = require("../../config/aws/aws.s3.config");
const { Users } = require("../../models");
const logger = require("../../utils/logger");
const admin = require("firebase-admin");
const {
  encryptPassword,
  comparePasswords,
} = require("../../utils/hashPassword");

jest.mock("../../config/aws/aws.s3.config");
jest.mock("../../models");
jest.mock("../../utils/logger");
jest.mock("../../utils/hashPassword");
jest.mock("firebase-admin", () => ({
  auth: jest.fn(), // This makes admin.auth a mock function
}));

describe("User Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getSignedUrlS3", () => {
    it("should return a signed URL and file URL", async () => {
      const fileName = "test-file";
      const fileType = "image/jpeg";
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/profiles/${Date.now()}-${fileName}`,
        ContentType: fileType,
        ACL: "public-read",
      };
      s3.getSignedUrlPromise.mockResolvedValue("https://signed-url.com");
      const result = await userServices.getSignedUrlS3(fileName, fileType);
      expect(result).toHaveProperty("signedURL");
      expect(result).toHaveProperty("fileUrl");
    });

    it("should throw an error if an error occurs", async () => {
      const fileName = "test-file";
      const fileType = "image/jpeg";
      s3.getSignedUrlPromise.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.getSignedUrlS3(fileName, fileType)
      ).rejects.toThrow();
    });
  });

  describe("addUser", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "Test User",
        mobileNumber: "1234567890",
        languagePreference: "en",
        latitude: 12.345,
        longitude: 67.89,
        role: "user",
      };
      Users.create.mockResolvedValue();
      await userServices.addUser(userData);
      expect(Users.create).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if an error occurs", async () => {
      const userData = {
        name: "Test User",
        mobileNumber: "1234567890",
        languagePreference: "en",
        latitude: 12.345,
        longitude: 67.89,
        role: "user",
      };
      Users.create.mockRejectedValue(new Error("Test error"));
      await expect(() => userServices.addUser(userData)).rejects.toThrow();
    });
  });

  describe("getUserByMobileNumber", () => {
    it("should return a user by mobile number", async () => {
      const mobileNumber = "1234567890";
      Users.findOne.mockResolvedValue({ id: 1, name: "Test User" });
      const result = await userServices.getUserByMobileNumber(mobileNumber);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
    });

    it("should throw an error if mobile number is invalid", async () => {
      await expect(() =>
        userServices.getUserByMobileNumber(null)
      ).rejects.toThrow("The mobile number is invalid.");
    });

    it("should throw an error if an error occurs", async () => {
      const mobileNumber = "1234567890";
      Users.findOne.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.getUserByMobileNumber(mobileNumber)
      ).rejects.toThrow();
    });
  });

  describe("getUserByID", () => {
    it("should return a user by ID", async () => {
      const id = 1;
      Users.findByPk.mockResolvedValue({ id: 1, name: "Test User" });
      const result = await userServices.getUserByID(id);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
    });

    it("should throw an error if ID is invalid", async () => {
      await expect(() => userServices.getUserByID(null)).rejects.toThrow(
        "Invalid user ID: ID cannot be null or undefined"
      );
    });

    it("should throw an error if an error occurs", async () => {
      const id = 1;
      Users.findByPk.mockRejectedValue(new Error("Test error"));
      await expect(() => userServices.getUserByID(id)).rejects.toThrow();
    });
  });

  describe("updateUserDetails", () => {
    it("should update a user's details", async () => {
      const userId = 1;
      const data = {
        home: "Test Home",
        familyName: "Test Family",
        pinCode: "123456",
        profileImage: "https://example.com/image.jpg",
        password: "password123",
        latitude: 12.345,
        longitude: 67.89,
      };
      Users.update.mockResolvedValue();
      await userServices.updateUserDetails({ userId, data });
      expect(Users.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if ID is invalid", async () => {
      const userId = null;
      const data = {
        home: "Test Home",
        familyName: "Test Family",
        pinCode: "123456",
        profileImage: "https://example.com/image.jpg",
        password: "password123",
        latitude: 12.345,
        longitude: 67.89,
      };
      await expect(() =>
        userServices.updateUserDetails({ userId, data })
      ).rejects.toThrow("Invalid user ID: ID cannot be null or undefined");
    });

    it("should throw an error if an error occurs", async () => {
      const userId = 1;
      const data = {
        home: "Test Home",
        familyName: "Test Family",
        pinCode: "123456",
        profileImage: "https://example.com/image.jpg",
        password: "password123",
        latitude: 12.345,
        longitude: 67.89,
      };
      Users.update.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.updateUserDetails({ userId, data })
      ).rejects.toThrow();
    });
  });

  describe("setPreferredLanguage", () => {
    it("should set a user's preferred language", async () => {
      const userId = 1;
      const language = "en";
      Users.update.mockResolvedValue();
      await userServices.setPreferredLanguage(userId, language);
      expect(Users.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if ID is invalid", async () => {
      const userId = null;
      const language = "en";
      await expect(() =>
        userServices.setPreferredLanguage(userId, language)
      ).rejects.toThrow("Invalid user ID: ID cannot be null or undefined");
    });

    it("should throw an error if an error occurs", async () => {
      const userId = 1;
      const language = "en";
      Users.update.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.setPreferredLanguage(userId, language)
      ).rejects.toThrow();
    });
  });

  describe("changeUserRole", () => {
    it("should change a user's role", async () => {
      const userId = 1;
      const role = "user";
      Users.update.mockResolvedValue();
      await userServices.changeUserRole(userId, role);
      expect(Users.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if ID is invalid", async () => {
      const userId = null;
      const role = "user";
      await expect(() =>
        userServices.changeUserRole(userId, role)
      ).rejects.toThrow("Invalid user ID: ID cannot be null or undefined");
    });

    it("should throw an error if an error occurs", async () => {
      const userId = 1;
      const role = "user";
      Users.update.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.changeUserRole(userId, role)
      ).rejects.toThrow();
    });
  });

  describe("addPassword", () => {
    it("should add a password to a user", async () => {
      const userId = 1;
      const password = "password123";
      encryptPassword.mockResolvedValue("hashed-password");
      Users.findByPk.mockResolvedValue({ password: null });
      Users.update.mockResolvedValue();
      await userServices.addPassword(userId, password);
      expect(Users.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if ID is invalid", async () => {
      const userId = null;
      const password = "password123";
      await expect(() =>
        userServices.addPassword(userId, password)
      ).rejects.toThrow("Invalid user ID: ID cannot be null or undefined");
    });

    it("should throw an error if user already has a password", async () => {
      const userId = 1;
      const password = "password123";
      Users.findByPk.mockResolvedValue({ password: "existing-password" });
      await expect(() =>
        userServices.addPassword(userId, password)
      ).rejects.toThrow(
        "User already has a password. Please select update password."
      );
    });

    it("should throw an error if an error occurs", async () => {
      const userId = 1;
      const password = "password123";
      encryptPassword.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.addPassword(userId, password)
      ).rejects.toThrow();
    });
  });

  describe("updatePassword", () => {
    it("should update a user's password", async () => {
      const userId = 1;
      const oldPassword = "old-password";
      const newPassword = "new-password";
      Users.findByPk.mockResolvedValue({ password: "existing-password" });
      encryptPassword.mockResolvedValue("new-hashed-password");
      comparePasswords.mockResolvedValueOnce(true);
      comparePasswords.mockResolvedValueOnce(false);
      Users.update.mockResolvedValue();
      await userServices.updatePassword(userId, oldPassword, newPassword);
      expect(Users.update).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if ID is invalid", async () => {
      const userId = null;
      const oldPassword = "old-password";
      const newPassword = "new-password";
      await expect(() =>
        userServices.updatePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow("Invalid user ID: ID cannot be null or undefined");
    });

    it("should throw an error if old password is incorrect", async () => {
      const userId = 1;
      const oldPassword = "old-password";
      const newPassword = "new-password";
      Users.findByPk.mockResolvedValue({ password: "existing-password" });
      comparePasswords.mockResolvedValueOnce(false);
      await expect(() =>
        userServices.updatePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow(
        "The old password you entered doesn't match with the saved password."
      );
    });

    it("should throw an error if new password is the same as the old password", async () => {
      const userId = 1;
      const oldPassword = "old-password";
      const newPassword = "old-password";
      Users.findByPk.mockResolvedValue({ password: "existing-password" });
      comparePasswords.mockResolvedValueOnce(true);
      comparePasswords.mockResolvedValueOnce(true);
      await expect(() =>
        userServices.updatePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow(
        "You cannot enter same password as previous password. Please change new password."
      );
    });

    it("should throw an error if an error occurs", async () => {
      const userId = 1;
      const oldPassword = "old-password";
      const newPassword = "new-password";
      Users.findByPk.mockRejectedValue(new Error("Test error"));
      await expect(() =>
        userServices.updatePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow();
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      Users.findAll.mockResolvedValue([{ id: 1, name: "Test User" }]);
      const result = await userServices.getAllUsers();
      expect(result).toBeInstanceOf(Array);
    });

    it("should throw an error if an error occurs", async () => {
      Users.findAll.mockRejectedValue(new Error("Test error"));
      await expect(() => userServices.getAllUsers()).rejects.toThrow();
    });
  });

  describe("logoutUser", () => {
    it("should logout a user", async () => {
      const idToken = "test-id-token";
      admin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: "test-uid" }),
        revokeRefreshTokens: jest.fn(),
      });
      await userServices.logoutUser(idToken);
    });

    it("should throw an error if ID token is not provided", async () => {
      await expect(() => userServices.logoutUser()).rejects.toThrow(
        "No token provided."
      );
    });

    it("should throw an error if an error occurs", async () => {
      const idToken = "test-id-token";
      admin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockRejectedValue(new Error("Test error")),
      });
      await expect(() => userServices.logoutUser(idToken)).rejects.toThrow();
    });
  });
});
