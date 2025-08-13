/**
 * @file logger.js
 * @description Configure winston logger
 * Winston will be used to log the information, error, warning for particular files/console.
 * @version v1.0.0
 * @created 13-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const winston = require("winston");
const { combine, timestamp, printf, colorize } = winston.format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// create the logger for logging messages
const logger = winston.createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

module.exports = logger;
