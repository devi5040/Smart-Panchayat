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
