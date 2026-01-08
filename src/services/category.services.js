/**
 * @filename category.services.js
 * @description This service file provides functions for managing product categories.  It handles retrieving all categories, generating
 * pre-signed URLs for uploading category images to AWS S3, adding new categories, updating existing categories, and deleting categories.
 * Input validation is included to ensure data integrity.
 *
 * @version v1.0.0
 * @updated Aug 22 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

// category.services.js
// Service functions for managing categories.  Uses Sequelize models and AWS S3 for image storage.

const { Category } = require('../models/'); // Import the Category model.
const s3 = require('../config/aws/aws.s3.config'); // Import AWS S3 configuration.
const { NotFoundError } = require('../utils/error');

/**
 * Retrieves all categories from the database.
 * @returns {Array<Object>} An array of Category objects.  Returns an empty array if no categories are found.  Throws an error if database
 * interaction fails.
 */
exports.getCategories = async () => {
  const categories = await Category.findAll();
  return categories;
};

/**
 * Generates a pre-signed URL for uploading a category image to AWS S3.
 * @param {string} fileName - The name of the file to be uploaded.
 * @param {string} fileType - The MIME type of the file.
 * @returns {Object} An object containing the signed URL and the final file URL. Throws an error if S3 interaction fails.
 */
exports.getSignedUrl = async (fileName, fileType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // S3 bucket name from environment variables.
    Key: `uploads/category/${Date.now()}-${fileName}`, // S3 key for the file, includes timestamp to avoid collisions.
    ContentType: fileType, // MIME type of the file.
    ACL: 'public-read', // Access Control List: makes the file publicly readable.
  };
  const signedURL = await s3.getSignedUrlPromise('putObject', params); // Get pre-signed URL from AWS S3.
  return {
    signedURL, // Pre-signed URL for uploading.
    fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`, //The complete URL of the uploaded file.
  };
};

/**
 * Adds a new category to the database.
 * @param {string} name - The name of the category.
 * @param {string} imageUrl - The URL of the category image.
 * Throws an error if database interaction fails.
 */
exports.addCategory = async (name, imageUrl) => {
  const category = await Category.create({ name_en: name, name_kn: name, imageUrl }); // Create a new category in the database.
  return category;
};

/**
 * Updates an existing category in the database.
 * @param {number} categoryId - The ID of the category to update.
 * @param {string} name - The new name of the category.
 * @param {string} imageUrl - The new URL of the category image.
 */
exports.updateCategory = async (categoryId, name_en, name_kn, imageUrl) => {
  if (categoryId === null || categoryId === 0 || isNaN(categoryId))
    throw new Error('Category ID is not valid'); // Validate categoryId.
  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError('Category not found!');

  const updateData = {
    name_en,
    name_kn,
  };

  if (imageUrl) updateData.imageUrl = imageUrl;

  const [updatedRows] = await Category.update(
    updateData,
    { where: { id: categoryId } }, // Update the category with the given ID.
  );
  if (updatedRows == 0) throw new Error('Category ID is not valid. No records updated.'); // Throw error if no rows were updated.
  return true;
};

/**
 * Deletes a category from the database.
 * @param {number} categoryId - The ID of the category to delete.
 * Throws an error if the category ID is invalid or if database interaction fails.
 */
exports.deleteCategory = async (categoryId) => {
  if (categoryId === null || categoryId === 0 || isNaN(categoryId))
    throw new Error('Category ID is not valid'); // Validate categoryId.
  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError('Category not found!');
  const numOfDeletedRows = await Category.destroy({
    where: { id: categoryId }, // Delete the category with the given ID.
  });
  if (numOfDeletedRows == 0) throw new Error('Category ID is invalid. No records deleted.'); // Throw error if no rows were deleted.
  return true;
};

exports.fetchPaginatedCategories = async (pageNumber, limit = 10) => {
  const page = Number(pageNumber) || 1;
  const offset = (page - 1) * Number(limit);

  const { count, rows: categories } = await Category.findAndCountAll({
    limit: Number(limit),
    offset,
  });
  const totalPages = Math.ceil(count / limit);
  return { categories, totalPages };
};

exports.fetchCategoryDetails = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError('Category not found!');
  return category;
};
