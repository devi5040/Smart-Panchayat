const { Category } = require("../models/");
const s3 = require("../config/aws/aws.s3.config");

exports.getCategories = async () => {
  try {
    const categories = await Category.findAll();
    return categories;
  } catch (error) {
    throw error;
  }
};

exports.getSignedUrl = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `/uploads/category/${Date.now()}-${fileName}`,
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
    throw error;
  }
};

exports.addCategory = async (name, imageUrl) => {
  try {
    await Category.create({ name, imageUrl });
    return true;
  } catch (error) {
    throw error;
  }
};

exports.updateCategory = async (categoryId, name, imageUrl) => {
  if (categoryId === null || categoryId === 0 || isNaN(categoryId))
    throw new Error("Category ID is not valid");
  try {
    const updatedRows = await Category.update(
      { name, imageUrl },
      { where: { id: categoryId } }
    );
    if (updatedRows == 0)
      throw new Error("Category ID is not valid. No records updated.");
    return true;
  } catch (error) {
    throw error;
  }
};
