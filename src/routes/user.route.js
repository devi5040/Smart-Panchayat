/**
 * @filename user.route.js
 * @description This file defines all the API routes for user management.  It leverages Express.js routing to handle various HTTP requests
 * related to user creation, retrieval, updates, and authentication.  Middleware is used for authentication (Firebase), input validation, and
 * file uploads.
 *
 * @version v1.0.0
 * @updated Thu Aug 21 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const router = require('express').Router();
const userController = require('../controllers/user.controller');

const authMiddleware = require('../middleware/firebaseAuthMiddleware');
//import validation middleware and schemas
const validate = require('../middleware/validation.middleware');
const fileUploadValidation = require('../utils/validation/fileUploadValidation');
const userDataValidation = require('../utils/validation/user.validate');

router.post('/signed-url', validate(fileUploadValidation), userController.getSignedURL);

router.get('/', authMiddleware, userController.getAllUsers);

router.post('/', validate(userDataValidation.createUserDataSchema), userController.addUser);

router.get('/:userId', authMiddleware, userController.getUserDetails);

router.get('/status/:status', userController.getUsersByStatus);

router.get('/role/:role', userController.getUsersByRole);

router.put(
  '/update-profile/:userId',
  authMiddleware,
  validate(userDataValidation.updateUserDataSchema),
  userController.updateProfile,
);

router.patch(
  '/language-change',
  authMiddleware,
  validate(userDataValidation.updateLanguageSchema),
  userController.updateLanguagePreferrence,
);

router.patch('/change-role', authMiddleware, userController.changeUserRole);

router.patch(
  '/add-password',
  authMiddleware,
  validate(userDataValidation.passwordSchema),
  userController.addPassword,
);

router.patch(
  '/update-password',
  authMiddleware,
  validate(userDataValidation.updatePasswordSchema),
  userController.updatePassword,
);

router.post('/logout', authMiddleware, userController.logout);

module.exports = router;
