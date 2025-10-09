/**
 * @file server.js
 * @description Entry point for the application. Handles server startup,
 * database connection initialization, and graceful shutdown.
 * This file imports the configured Express app from app.js and starts listening on the specified port.
 * @version v1.0.0
 * @created 13-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const app = require('./app');
const logger = require('./utils/logger');
const sequelize = require('./config/db');
const syncProductsToElasticSearch = require('./utils/elasticsearch.sync');

// Initialize PORT
const PORT = process.env.PORT || 5050;

// Initialize the db and start server if db is connected
const startServer = async () => {
  try {
    // Verify db connection
    await sequelize.authenticate();
    logger.info('The db is connected successfully');
    await syncProductsToElasticSearch();
    // sync the db
    await sequelize.sync();

    app.listen(PORT, () => {
      logger.info(`The server started with port: ${PORT}`);
    });
  } catch (error) {
    logger.error(`Some internal error has occurred: ${error}`);
  }
};

startServer();
