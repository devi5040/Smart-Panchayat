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
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./utils/logger");

const app = express();

// ===============
// Middleware
// ===============
app.use(express.json());
app.use(helmet());
// stream morgan logs to winston's http level
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// ===============
// health check endpoint
// ===============
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", uptime: process.uptime, timestamp: new Date() });
});

module.exports = app;
