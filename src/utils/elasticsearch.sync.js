const { Products, Category, Users } = require('../models');
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

async function syncUsersToElasticSearch() {
  const users = await Users.findAll({ where: { user_role: 'user' } });

  const body = users.flatMap((user) => {
    const esDoc = {
      id: user.id,
      user_name_en: user.user_name_en,
      user_name_kn: user.user_name_kn,
      family_name_en: user.family_name_en,
      family_name_kn: user.family_name_kn,
      home_address_en: user.home_address_en,
      home_address_kn: user.home_address_kn,
      phone_number: user.phone_number,
    };

    return [{ index: { _index: 'users', _id: user.id } }, esDoc];
  });

  if (body.length > 0) {
    await esClient.bulk({ refresh: true, body });
    logger.info(`Synced ${users.length} users to Elastic Search`);
  } else {
    logger.error(`Error while syncing data to the elastic search`);
  }
}

module.exports = { syncProductsToElasticSearch, syncUsersToElasticSearch };
