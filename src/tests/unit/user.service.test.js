const {
  getSignedUrlS3,
  addUser,
  getUserByMobileNumber,
  getUserByID,
} = require("../../services/user.services");
const { Users } = require("../../models");
const logger = require("../../utils/logger");
const s3 = require("../../config/aws/aws.s3.config");

// Mock external dependencies
jest.mock("../../config/aws/aws.s3.config");
jest.mock("../../models");
jest.mock("../../utils/logger");

describe("getSignedUrlS3", () => {
  beforeAll(() => {
    process.env.AWS_BUCKET_NAME = "test-bucket";
    process.env.AWS_REGION = "test-region";
  });

  afterAll(() => {
    delete process.env.AWS_BUCKET_NAME;
    delete process.env.AWS_REGION;
  });

  beforeEach(() => {
    s3.getSignedUrlPromise.mockClear();
  });

  it("should generate a signed URL and file URL successfully", async () => {
    const fileName = "test.txt";
    const fileType = "text/plain";
    const mockSignedUrl = "https://test.com/signedUrl";
    s3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);

    const result = await getSignedUrlS3(fileName, fileType);

    expect(s3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
      Bucket: "test-bucket",
      Key: expect.stringMatching(/^uploads\/profiles\/\d+-test\.txt$/),
      ContentType: fileType,
      ACL: "public-read",
    });
    expect(result).toEqual(
      expect.objectContaining({
        signedURL: mockSignedUrl,
        fileUrl: expect.stringMatching(
          /^https:\/\/test-bucket\.s3\.test-region\.amazonaws\.com\/uploads\/profiles\/\d+-test\.txt$/
        ),
      })
    );
  });

  it("should handle errors during URL generation", async () => {
    const fileName = "test.txt";
    const fileType = "text/plain";
    const errorMessage = "S3 error";
    s3.getSignedUrlPromise.mockRejectedValue(new Error(errorMessage));

    await expect(getSignedUrlS3(fileName, fileType)).rejects.toThrow(
      `Error generating signed URL: ${errorMessage}`
    );
  });

  it("should handle invalid inputs", async () => {
    await expect(getSignedUrlS3(null, null)).rejects.toThrow();
    await expect(getSignedUrlS3("", "")).rejects.toThrow();
    await expect(getSignedUrlS3(undefined, undefined)).rejects.toThrow();
  });

  it("should use environment variables", async () => {
    const fileName = "test.txt";
    const fileType = "text/plain";
    const mockSignedUrl = "https://test.com/signedUrl";
    s3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);

    const result = await getSignedUrlS3(fileName, fileType);

    expect(result.fileUrl).toContain(process.env.AWS_BUCKET_NAME);
    expect(result.fileUrl).toContain(process.env.AWS_REGION);
  });
});

describe("addUser", () => {
  beforeEach(() => {
    Users.create.mockClear();
    logger.info.mockClear();
    logger.error.mockClear();
  });

  it("should create a user successfully", async () => {
    const user = {
      name: "Test User",
      mobileNumber: "1234567890",
      languagePreference: "en",
      latitude: 12.12,
      longitude: 77.77,
      role: "user",
    };
    await addUser(user);
    expect(Users.create).toHaveBeenCalledWith({
      user_name: user.name,
      phone_number: user.mobileNumber,
      language_preference: user.languagePreference,
      latitude: user.latitude,
      longitude: user.longitude,
      role: user.role,
    });
    expect(logger.info).toHaveBeenCalledWith("User created successfully");
  });

  it("should handle errors during user creation", async () => {
    const user = {
      name: "Test User",
      mobileNumber: "1234567890",
      languagePreference: "en",
      latitude: 12.12,
      longitude: 77.77,
      role: "user",
    };
    const error = new Error("Database error");
    Users.create.mockRejectedValue(error);

    await expect(addUser(user)).rejects.toThrow(error);
    expect(logger.error).toHaveBeenCalledWith(
      `Error while creating user: ${error}`
    );
  });

  it("should handle invalid inputs", async () => {
    await expect(addUser({})).rejects.toThrow();
    await expect(addUser(null)).rejects.toThrow();
    await expect(addUser(undefined)).rejects.toThrow();
    await expect(addUser({ name: "" })).rejects.toThrow();
    // Add more tests for other invalid inputs
  });

  describe("getUserByMobileNumber", () => {
    beforeAll(() => {});

    afterAll(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {});

    it("should successfully retrieve a user by mobile number", async () => {
      const mockUser = {
        id: 1,
        phone_number: "+15551234567",
        // ... other user properties
      };
      Users.findAll.mockResolvedValue([mockUser]);

      const users = await getUserByMobileNumber("+15551234567");
      expect(users).toEqual([mockUser]);
      expect(Users.findAll).toHaveBeenCalledWith({
        where: { phone_number: "+15551234567" },
      });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should handle errors during database retrieval", async () => {
      const mockError = new Error("Database error");
      Users.findAll.mockRejectedValue(mockError);

      await expect(getUserByMobileNumber("+15551234567")).rejects.toThrow(
        mockError
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error while retrieving user by mobile number:")
      );
      Users.findAll.mockRestore();
    });

    it("should handle empty result set from database", async () => {
      Users.findAll.mockResolvedValue([]);
      const users = await getUserByMobileNumber("+15551234567");
      expect(users).toEqual([]);
      expect(Users.findAll).toHaveBeenCalledWith({
        where: { phone_number: "+15551234567" },
      });
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe("getUserByID", () => {
    it("should retrieve a user by ID successfully", async () => {
      const userId = 1;
      const mockUser = { id: userId };
      Users.findByPk.mockResolvedValue(mockUser);

      const user = await getUserByID(userId);
      expect(Users.findByPk).toHaveBeenCalledWith(userId);
      expect(user).toEqual(mockUser);
    });

    it("should handle user not found", async () => {
      const userId = 1;
      Users.findByPk.mockResolvedValue(null);
      const user = await getUserByID(userId);
      expect(user).toBeNull();
    });

    it("should handle invalid user ID (null)", async () => {
      const userId = null;
      await expect(getUserByID(userId)).rejects.toThrow(
        "Invalid user ID: ID cannot be null or undefined"
      );
    });

    it("should handle invalid user ID (undefined)", async () => {
      const userId = undefined;
      await expect(getUserByID(userId)).rejects.toThrow(
        "Invalid user ID: ID cannot be null or undefined"
      );
    });

    it("should handle ID 0", async () => {
      const userId = 0;
      const user = await getUserByID(userId);
      expect(user).toBeNull();
    });

    it("should handle errors during user retrieval", async () => {
      const userId = 1;
      const mockError = new Error("Database error");
      Users.findByPk.mockRejectedValue(mockError);

      await expect(getUserByID(userId)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith(
        `Error while retrieving user by ID: ${mockError}`
      );
    });
  });
});
