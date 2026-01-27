/**
 * @filename agent.route.js
 * @description This file sets up the Express.js router for managing agents.  It defines routes for creating new agents, changing an agent's role,
 * and deleting agents.  It uses middleware for input validation before creating agents.
 *
 * @version v1.0.0
 * @updated Sep 4, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const express = require('express');
const router = express.Router(); // Use express.Router() for better modularity

const agentController = require('../controllers/agent.controller');

const validate = require('../middleware/validation.middleware');
const schema = require('../utils/validation/user.validate');

const auth = require('../middleware/firebaseAuthMiddleware');
const access = require('../middleware/authorization.middleware');

/**
 * @route POST /
 * @description Creates a new agent.
 * @param {object} req - Express request object.
 * @param {object} req.body - Request body containing agent data.  Should conform to schema.createUserDataSchema.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Error} If validation fails or agent creation fails.  Error details will be included in the response.  See agentController.createAgent for specifics.
 * @returns {object} - If successful, returns the newly created agent data. Otherwise, returns an appropriate error response.  The response format is determined by agentController.createAgent.
 * @see {@link agentController.createAgent}
 */
router.post(
  '/',
  validate(schema.createAgentSchema), // Validates the request body against the specified schema before hitting the controller
  auth,
  access(['admin']),
  agentController.createAgent,
);

/**
 * @route PATCH /:userId
 * @description Changes the role of a user to an agent.  Assumes userId identifies a user in the database.  Sequelize model should handle ID resolution.
 * @param {object} req - Express request object.
 * @param {string} req.params.userId - ID of the user to change the role.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Error} If the user is not found, or if there's an error changing the role. Error details should be in the response. See agentController.changeRoleToAgent for specifics.
 * @returns {object} - On success, may return updated user data or a success message. Error responses are determined by agentController.changeRoleToAgent.
 * @see {@link agentController.changeRoleToAgent}
 */
router.patch('/:userId', auth, access(['admin']), agentController.changeRoleToAgent);

/**
 * @route DELETE /:agentId
 * @description Removes an agent. Assumes agentId identifies an agent in the database. Sequelize model should handle ID resolution and deletion.
 * @param {object} req - Express request object.
 * @param {string} req.params.agentId - ID of the agent to remove.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Error} If the agent is not found or if there's an error during removal. Error details will be in the response. See agentController.removeAgent for specifics.
 * @returns {object} - On success, may return a success message or confirmation. Error responses are handled by agentController.removeAgent.
 * @see {@link agentController.removeAgent}
 */
router.delete('/:agentId', auth, access(['admin']), agentController.removeAgent);

router.get('/dashboard', auth, access(['admin', 'agent']), agentController.fetchDashboardStats);

module.exports = router;
