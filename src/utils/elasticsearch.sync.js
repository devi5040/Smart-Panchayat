const { Products, Category } = require('../models');
const esClient = require('../config/elasticsearch.config');
const logger = require('./logger');

async function syncProductsToElasticSearch() {
  const products = await Products.findAll({
    include: {
      model: Category,
      attributes: ['name_en', 'name_kn'],
    },
  });

  const body = products.flatMap((product) => {
    const productJSON = product.toJSON();
    const esDoc = {
      ...productJSON,
      category: {
        name_en: productJSON.category ? productJSON.category.name_en : null,
        name_kn: productJSON.category ? productJSON.category.name_kn : null,
      },
    };

    return [{ index: { _index: 'products', _id: product.id } }, esDoc];
  });

  if (body.length > 0) {
    await esClient.bulk({ refresh: true, body });
    logger.info(`Synced ${products.length} products to Elasticsearch`);
  } else {
    logger.error(`Error while syncing data to the elastic search`);
  }
}

module.exports = syncProductsToElasticSearch;
