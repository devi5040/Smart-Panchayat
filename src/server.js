/**
 * @file server.js
 * @description Entry point for the application. Handles server startup,
 * database connection initialization, and graceful shutdown.
 * This file imports the configured Express app from app.js and starts listening on the specified port.
 * @version v1.0.0
 * @created 13-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ debug: false });

// Initialize PORT
const PORT = process.env.PORT || 5050;

app.listen(PORT, (req, res) => {
  console.log(`Server started with port: ${PORT}`);
});
