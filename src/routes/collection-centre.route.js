const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/firebaseAuthMiddleware');
const checkPermissions = require('../middleware/authorization.middleware');

const collectionCentreController = require('../controllers/collection-centre.controller');

router.get(
  '/',
  checkAuth,
  checkPermissions(['admin']),
  collectionCentreController.getCollectionCentres,
);

module.exports = router;
