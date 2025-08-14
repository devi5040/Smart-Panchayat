/**
 * @file firebase_config.js
 * @description This file contains the Firebase project settings required to initialize the Firebase app in our app.
 * Typically, this includes API key, auth domain, project ID, storage bucket, messaging sender ID, app ID, and optionally measurement ID.
 *
 * @version v1.0.0
 * @created 14-08-2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const admin = require("firebase-admin");

// Path to the json service key file exported from firebase.
const serviceAccount = require("./smart-panchayat-firebase-secret-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
