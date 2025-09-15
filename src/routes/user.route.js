/**
 * @filename user.route.js
 * @description This file sets up all the API routes for managing users.  It uses Express.js to handle requests for creating, reading,
 * updating, and authenticating users.  Firebase is used for authentication, and middleware handles input validation and file uploads.
 *
 * @version v1.0.0
 * @updated Mon Sep 08 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */
const router = require('express').Router();
const userController = require('../controllers/user.controller');

/** @type {import('../middleware/firebaseAuthMiddleware')} */
const authMiddleware = require('../middleware/firebaseAuthMiddleware');

/** @type {import('../middleware/validation.middleware')} */
const validate = require('../middleware/validation.middleware');

/** @type {import('../utils/validation/fileUploadValidation')} */
const fileUploadValidation = require('../utils/validation/fileUploadValidation');

/** @type {import('../utils/validation/user.validate')} */
const userDataValidation = require('../utils/validation/user.validate');

/**
 * @openapi
 * /signed-url:
 *   post:
 *     summary: Get a pre-signed URL for file upload.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FileUploadSchema'
 *     responses:
 *       '200':
 *         description: Successful response with pre-signed URL.
 *       '400':
 *         description: Bad Request - Validation error.
 */
router.post(
  '/signed-url',
  validate(fileUploadValidation.fileUploadSchema),
  userController.getSignedURL,
);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: Successful response with list of users.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.get('/', authMiddleware, userController.getAllUsers);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserSchema'
 *     responses:
 *       '201':
 *         description: User created successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.post(
  '/',
  validate(userDataValidation.createUserDataSchema),
  authMiddleware,
  userController.addUser,
);

/**
 * @openapi
 * /users/check-existence:
 *   get:
 *     summary: Check if the authenticated user exists and has required profile data.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: User existence status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User status fetched successfully."
 *                 status:
 *                   type: boolean
 *                   example: true
 *       '401':
 *         description: Unauthorized - Requires authentication.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/check-existence', authMiddleware, userController.checkUserExists);

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     summary: Get user details by ID.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *     responses:
 *       '200':
 *         description: Successful response with user details.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 *       '404':
 *         description: User not found.
 */
router.get('/:userId', authMiddleware, userController.getUserDetails);

/**
 * @openapi
 * /users/status/{status}:
 *   get:
 *     summary: Get users by status.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: Status of the users to retrieve (e.g., 'active', 'inactive').
 *     responses:
 *       '200':
 *         description: Successful response with list of users.
 *       '404':
 *         description: No users found with specified status.
 */
router.get('/status/:status', userController.getUsersByStatus);

/**
 * @openapi
 * /users/role/{role}:
 *   get:
 *     summary: Get users by role.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: role
 *         schema:
 *           type: string
 *         required: true
 *         description: Role of the users to retrieve (e.g., 'admin', 'user').
 *     responses:
 *       '200':
 *         description: Successful response with list of users.
 *       '404':
 *         description: No users found with specified role.
 */
router.get('/role/:role', authMiddleware, userController.getUsersByRole);

/**
 * @openapi
 * /users/update-profile/{userId}:
 *   put:
 *     summary: Update user profile.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserSchema'
 *     responses:
 *       '200':
 *         description: User profile updated successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 *       '404':
 *         description: User not found.
 */
router.put(
  '/update-profile/:userId',
  authMiddleware,
  validate(userDataValidation.updateUserDataSchema),
  userController.updateProfile,
);

/**
 * @openapi
 * /users/language-change:
 *   patch:
 *     summary: Update user language preference.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLanguageSchema'
 *     responses:
 *       '200':
 *         description: User language preference updated successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.patch(
  '/language-change',
  authMiddleware,
  validate(userDataValidation.updateLanguageSchema),
  userController.updateLanguagePreferrence,
);

/**
 * @openapi
 * /users/change-role:
 *   patch:
 *     summary: Change user role.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user whose role needs to be changed.
 *               newRole:
 *                 type: string
 *                 description: New role for the user.
 *     responses:
 *       '200':
 *         description: User role changed successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 *       '404':
 *         description: User not found.
 */
router.patch('/change-role', authMiddleware, userController.changeUserRole);

/**
 * @openapi
 * /users/add-password:
 *   patch:
 *     summary: Add a password to a user account.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordSchema'
 *     responses:
 *       '200':
 *         description: Password added successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.patch(
  '/add-password',
  authMiddleware,
  validate(userDataValidation.passwordSchema),
  userController.addPassword,
);

/**
 * @openapi
 * /users/update-password:
 *   patch:
 *     summary: Update user password.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordSchema'
 *     responses:
 *       '200':
 *         description: Password updated successfully.
 *       '400':
 *         description: Bad Request - Validation error or other error.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.patch(
  '/update-password',
  authMiddleware,
  validate(userDataValidation.updatePasswordSchema),
  userController.updatePassword,
);

/**
 * @openapi
 * /users/logout:
 *   post:
 *     summary: Log out the current user.
 *     tags: [Users]
 *     security:
 *       - Firebase: []
 *     responses:
 *       '200':
 *         description: User logged out successfully.
 *       '401':
 *         description: Unauthorized - Requires authentication.
 */
router.post('/logout', authMiddleware, userController.logout);

module.exports = router;
