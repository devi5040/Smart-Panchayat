const s3 = require("../config/aws/aws.s3.config");

exports.uploadFileToS3 = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/profiles/${Date.now()}-${fileName}`,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const signedURL = await s3.getSignedUrlPromise("putObject", params);
    return {
      signedURL,
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
  } catch (error) {
    throw new Error(`Error generating signed URL: ${error.message}`);
  }
};
