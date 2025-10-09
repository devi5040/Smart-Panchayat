const { Products, Category } = require('../models');
const esClient = require('../config/elasticsearch.config');
const logger = require('./logger');

async function syncProductsToElasticSearch() {
  const products = await Products.findAll({
    include: {
      model: Category,
      attributes: ['name'],
    },
  });

  const body = products.flatMap((product) => {
    const productJSON = product.toJSON();
    const esDoc = {
      ...productJSON,
      category: productJSON.category ? productJSON.category.name : null,
    };

    return [{ index: { _index: 'products', _id: product.id } }, esDoc];
  });

  await esClient.bulk({ refresh: true, body });
  logger.info(`Synced ${products.length} products to Elasticsearch`);
}

module.exports = syncProductsToElasticSearch;
