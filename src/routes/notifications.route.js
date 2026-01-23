const express = require('express');
const router = express.Router();

const auth = require('../middleware/firebaseAuthMiddleware');
const access = require('../middleware/authorization.middleware');

const notificationsController = require('../controllers/notifications.controller');

router.get('/', auth, access(['admin']), notificationsController.fetchNotifications);

router.post('/save-token', auth, notificationsController.saveToken);

router.post('/notify-users', auth, access(['admin']), notificationsController.notifyUsers);

module.exports = router;
