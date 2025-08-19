const AWS = require("aws-sdk");
const { getSignedUrlS3 } = require("../../services/user.services");

jest.mock("aws-sdk", () => {
  const mS3 = { getSignedUrlPromise: jest.fn() };
  return {
    S3: jest.fn(() => mS3),
    config: { update: jest.fn() },
  };
});

describe("getSignedUrlS3", () => {
  let s3Instance;

  beforeAll(() => {
    process.env.AWS_BUCKET_NAME = "test-bucket";
    process.env.AWS_REGION = "test-region";
    s3Instance = new AWS.S3(); // mocked instance
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.AWS_BUCKET_NAME;
    delete process.env.AWS_REGION;
  });

  it("should generate a signed URL and return the public URL successfully", async () => {
    const mockSignedUrl = "https://example.com/signed-url";
    s3Instance.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);

    const result = await getSignedUrlS3("test.jpg", "image/jpeg");

    expect(s3Instance.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
      Bucket: "test-bucket",
      Key: expect.stringContaining("uploads/profiles/"),
      ContentType: "image/jpeg",
      ACL: "public-read",
    });

    expect(result).toEqual({
      signedURL: mockSignedUrl,
      fileUrl: expect.stringContaining(
        "test-bucket.s3.test-region.amazonaws.com/uploads/profiles/"
      ),
    });
  });

  it("should throw an error if S3 fails to generate signed URL", async () => {
    const error = new Error("S3 failure");
    s3Instance.getSignedUrlPromise.mockRejectedValue(error);

    await expect(getSignedUrlS3("file.txt", "text/plain")).rejects.toThrow(
      `Error generating signed URL: ${error.message}`
    );
  });

  it("should use the correct bucket name and region from environment variables", async () => {
    const mockSignedUrl = "https://example.com/signed-url";
    s3Instance.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);

    const result = await getSignedUrlS3("test.jpg", "image/jpeg");
    expect(result.fileUrl).toContain(process.env.AWS_BUCKET_NAME);
    expect(result.fileUrl).toContain(process.env.AWS_REGION);
  });

  it("should generate unique file keys for multiple uploads", async () => {
    const mockSignedUrl = "https://example.com/signed-url";
    s3Instance.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);

    const result1 = await getSignedUrlS3("file1.jpg", "image/jpeg");
    const result2 = await getSignedUrlS3("file2.jpg", "image/jpeg");

    expect(result1.fileUrl).not.toEqual(result2.fileUrl);
  });
});
