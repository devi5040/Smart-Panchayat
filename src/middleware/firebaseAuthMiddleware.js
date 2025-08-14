/**
 * @file firebaseAuthMiddleware.js
 * @description Express middleware for Firebase Authentication using phone number OTP.
 * It verifies the Firebase ID token sent in the `Authorization` header and attaches the authenticated user information to `req.user`.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const admin = require("../config/firebase/firebase_config");
const logger = require("../utils/logger");

const firebaseAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(
      `Unauthorized request: No token provided or invalid format. Header:${{
        headers: req.headers,
      }}`
    );
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error(`Invalid or expired token: ${error}`);
    res.status(500).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = firebaseAuthMiddleware;
