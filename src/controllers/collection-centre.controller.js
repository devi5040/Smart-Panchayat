const logger = require('../utils/logger');
const services = require('../services/collection-centre.services');

exports.getCollectionCentres = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const { collectionCentres, totalPages } = await services.fetchCollectionCentres(page, limit);
    res
      .status(200)
      .json({ message: 'Fetched collection centres successfully!', collectionCentres, totalPages });
  } catch (error) {
    logger.error(`Error while fetching the collection centres: ${error}`);
    res.status(500).json({
      message: 'Internal error while fetching the collection centres',
      error: error.message,
    });
  }
};

exports.addCollectionCentre = async (req, res) => {
  const { name_en, name_kn, address_en, address_kn, isProcessingUnit } = req.body;
  try {
    const collectionCentre = await services.addCollectionCentre(
      name_en,
      name_kn,
      address_en,
      address_kn,
      isProcessingUnit,
    );
    res.status(201).json({ message: 'Collection centre added successfully!', collectionCentre });
  } catch (error) {
    logger.error(`Error while adding the collection centre: ${error}`);
    res.status(500).json({
      message: 'Internal error while adding the collection centre',
      error: error.message,
    });
  }
};

exports.updateCollectionCentre = async (req, res) => {
  const { collectionCentreId } = req.params;
  const { name_en, name_kn, address_en, address_kn, isProcessingUnit } = req.body;
  try {
    const collectionCentre = await services.updateCollectionCentre(
      collectionCentreId,
      name_en,
      name_kn,
      address_en,
      address_kn,
      isProcessingUnit,
    );
    res.status(200).json({ message: 'Collection centre updated successfully!', collectionCentre });
  } catch (error) {
    logger.error(`Error while updating the collection centre: ${error}`);
    res.status(500).json({
      message: 'Internal error while updating the collection centre',
      error: error.message,
    });
  }
};

exports.getCollectionCentre = async (req, res) => {
  const { collectionCentreId } = req.params;
  try {
    const collectionCentre = await services.fetchCollectionCentreDetails(collectionCentreId);
    res.status(200).json({ message: 'Fetched collection centre successfully!', collectionCentre });
  } catch (error) {
    logger.error(`Error while fetching the collection centre: ${error}`);
    res
      .status(500)
      .json({
        message: 'Internal error while fetching the collection centre',
        error: error.message,
      });
  }
};

exports.deleteCollectionCentre = async (req, res) => {
  const { collectionCentreId } = req.params;
  try {
    const collectionCentre = await services.deleteCollectionCentre(collectionCentreId);
    res.status(200).json({ message: 'Collection centre deleted successfully!', collectionCentre });
  } catch (error) {
    logger.error(`Error while deleting the collection centre: ${error}`);
    res.status(500).json({
      message: 'Internal error while deleting the collection centre',
      error: error.message,
    });
  }
};
