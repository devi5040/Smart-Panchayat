/**
 * @filename category.controller.js
 * @description This file implements the controller logic for managing categories.  It handles requests for retrieving all categories, getting
 * a pre-signed URL for image uploads, adding new categories, updating existing categories, and deleting categories.  It uses the
 * `categoryServices` module for data access and the `logger` module for logging errors.
 *
 * @version v1.0.0
 * @updated Aug 22, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const categoryServices = require('../services/category.services');
const logger = require('../utils/logger');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryServices.getCategories();
    res.status(200).json({ message: 'Retrieved all categories successfully.', categories });
  } catch (error) {
    logger.error(`Internal error while getting all categories. ${error}`);
    res.status(500).json({
      message: 'Internal error while getting all categories.',
      error: error.message,
    });
  }
};

exports.getSignedUrl = async (req, res) => {
  const { fileName, fileType } = req.body;
  try {
    const { signedURL, fileUrl } = await categoryServices.getSignedUrl(fileName, fileType);
    res.status(200).json({
      message: 'Signed URL received successfully.',
      signedURL,
      fileUrl,
    });
  } catch (error) {
    logger.error(`Internal error while receiving signed url from amazon s3: ${error}`);
    res.status(500).json({
      message: 'Internal error while receiving signed URL from amazon s3.',
      error: error.message,
    });
  }
};

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  const image = req.file;
  try {
    if (!image) throw new Error('Category image is required');
    const imageUrl = `/category/${image.filename}`;
    const category = await categoryServices.addCategory(name, imageUrl);
    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    logger.error(`Internal error while creating a category: ${error}`);
    res.status(500).json({
      message: 'Internal error while adding a category',
      error: error.message,
    });
  }
};

exports.updateCatogory = async (req, res) => {
  const { categoryId } = req.params;
  const { name_en, name_kn } = req.body;
  const image = req.file;
  try {
    let imageUrl;
    if (image) imageUrl = `/category/${image.filename}`;
    await categoryServices.updateCategory(categoryId, name_en, name_kn, imageUrl);
    res.status(200).json({ message: 'Category details updated successfully.' });
  } catch (error) {
    logger.error(`Internal error while updating the category: ${error}`);
    res.status(500).json({
      message: 'Internal error while updating the category.',
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await categoryServices.deleteCategory(categoryId);
    res.status(200).json({ message: 'Category has deleted successfully' });
  } catch (error) {
    logger.error(`Internal error while deleting the category: ${JSON.stringify(error)}`);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: 'Internal error while deleting the category.',
      error: error.message,
    });
  }
};

exports.fetchPaginatedCategories = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const { categories, totalPages } = await categoryServices.fetchPaginatedCategories(page, limit);
    res.status(200).json({ message: 'Categories fetched successfully', categories, totalPages });
  } catch (error) {
    logger.error(`Internal error while fetching categories:${error}`);
    res.status(500).json({
      message: 'Internal error while fetching categories',
      error: error.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await categoryServices.fetchCategoryDetails(categoryId);
    res.status(200).json({ message: 'Fetched category details successfully', category });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while fetching category details: ${error}`);
    res
      .status(status)
      .json({ message: 'Internal error while fetching category details', error: error.message });
  }
};
