const sequelize = require('../config/sequelize.config');
const { CollectionCentre } = require('../models');

exports.fetchCollectionCentres = async (pageNumber, limit) => {
  const pageNum = Number(pageNumber);
  if (!pageNum || pageNum <= 0) {
    const collectionCentres = await CollectionCentre.findAll();
    if (!collectionCentres) throw new Error('Error finding collection centres');
    return { collectionCentres, totalPages: 1 };
  }

  const page = Number(pageNumber) || 1;
  const offset = (page - 1) * Number(limit);
  const { count, rows: collectionCentres } = await CollectionCentre.findAndCountAll({
    offset: offset,
    limit: Number(limit),
  });
  const totalPages = Math.ceil(count / Number(limit));
  return { collectionCentres, totalPages };
};
