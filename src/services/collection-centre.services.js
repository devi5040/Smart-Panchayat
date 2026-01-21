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

exports.addCollectionCentre = async (
  name_en,
  name_kn,
  address_en,
  address_kn,
  isProcessingUnit,
) => {
  const collectionCentre = await CollectionCentre.create({
    name_en,
    name_kn,
    address_en,
    address_kn,
    isProcessingUnit,
  });
  return collectionCentre;
};

exports.updateCollectionCentre = async (
  collectionCentreId,
  name_en,
  name_kn,
  address_en,
  address_kn,
  isProcessingUnit,
) => {
  const collectionCentre = await CollectionCentre.findByPk(collectionCentreId);
  if (!collectionCentre) throw new Error('Collection centre not found');
  const [numRowsUpdated] = await CollectionCentre.update(
    {
      name_en,
      name_kn,
      address_en,
      address_kn,
      isProcessingUnit,
    },
    { where: { id: collectionCentreId } },
  );
  if (numRowsUpdated === 0) throw new Error('No rows updated');
  return collectionCentre;
};

exports.fetchCollectionCentreDetails = async (collectionCentreId) => {
  const collectionCentre = await CollectionCentre.findByPk(collectionCentreId);
  return collectionCentre;
};

exports.deleteCollectionCentre = async (collectionCentreId) => {
  const collectionCentre = await CollectionCentre.findByPk(collectionCentreId);
  if (!collectionCentre) throw new Error('Collection centre not found');
  const numOfDeletedRows = await CollectionCentre.destroy({
    where: { id: collectionCentreId },
  });
  if (numOfDeletedRows == 0)
    throw new Error('Collection centre ID is invalid. No records deleted.');
  return true;
};
