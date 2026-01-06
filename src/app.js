/**
 * @file app.js
 * @description Express application configuration and middleware setup.
 * Initializes routes, middleware, and core application-level settings without starting the server.
 * This file exports the configured Express app instance for use in server startup or testing environments.
 *
 * @version 1.0.0
 * @created 13-08-2024
 * @updated 13-08-2024
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

// Importing required packages
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const routes = require('./routes');
const cors = require('cors');
const path = require('path');

const app = express();

// ===============
// Middleware
// ===============
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
);
// stream morgan logs to winston's http level
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);
app.use(cors({ origin: '*' }));
app.use('/api/v1/public', express.static(path.join(process.cwd(), 'public')));
app.use('/api/v1/', routes);

// ===============
// health check endpoint
// ===============
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime, timestamp: new Date() });
});

module.exports = app;
