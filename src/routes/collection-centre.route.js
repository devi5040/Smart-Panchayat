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

router.get(
  '/:collectionCentreId',
  checkAuth,
  checkPermissions(['admin']),
  collectionCentreController.getCollectionCentre,
);

router.post(
  '/',
  checkAuth,
  checkPermissions(['admin']),
  collectionCentreController.addCollectionCentre,
);

router.put(
  '/:collectionCentreId',
  checkAuth,
  checkPermissions(['admin']),
  collectionCentreController.updateCollectionCentre,
);

router.delete(
  '/:collectionCentreId',
  checkAuth,
  checkPermissions(['admin']),
  collectionCentreController.deleteCollectionCentre,
);

module.exports = router;
