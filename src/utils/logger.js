/**
 * @file logger.js
 * @description Winston logger (Vercel-safe)
 * @version v1.1.0
 */

const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Detect Vercel environment
const isVercel = process.env.VERCEL === "1";

// Transports
const transports = [
  new winston.transports.Console()
];

// Enable file logs ONLY in local environment
if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: "tmp/combined.log"
    }),
    new winston.transports.File({
      filename: "tmp/error.log",
      level: "error"
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: () =>
        new Date().toLocaleString("en-IN", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        }),
    }),
    logFormat
  ),
  transports,
});

module.exports = logger;
