/**
 * @filename agent.controller.js
 * @description This file implements the controller logic for managing agents.  It handles requests for creating new agents and removing existing agents, interacting with the underlying agent service layer to perform the necessary database operations.  Error handling is included to provide informative responses to clients.
 *
 * @version v1.0.0
 * @updated Sep 4, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const agentServices = require("../services/agent.services");
const logger = require("../utils/logger");

/**
 * Creates a new agent.
 * @async
 * @function createAgent
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} req.body.mobileNumber - The mobile number of the agent.
 * @param {string} req.body.name - The name of the agent.
 * @param {number} req.body.latitude - The latitude coordinate of the agent.
 * @param {number} req.body.longitude - The longitude coordinate of the agent.
 * @param {string} req.body.languagePreference - The preferred language of the agent.
 * @throws {Error} If an error occurs during agent creation.  The error will contain a `statusCode` property if available.
 */
exports.createAgent = async (req, res) => {
  const { mobileNumber, name, latitude, longitude, languagePreference } =
    req.body;
  try {
    /** @type {object} user - The newly created agent object from the database (likely a Sequelize instance).*/
    const user = await agentServices.addAgent(
      mobileNumber,
      name,
      latitude,
      longitude,
      languagePreference
    );
    res.status(201).json({ message: "Agent created successfully!", user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while creating agent: ${error}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while creating the agent. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Removes an agent by ID.
 * @async
 * @function removeAgent
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {number|string} req.params.agentId - The ID of the agent to remove.  Should match the data type of the primary key in your Sequelize model.
 * @throws {Error} If an error occurs during agent removal. The error will contain a `statusCode` property if available.
 */
exports.removeAgent = async (req, res) => {
  const { agentId } = req.params;
  try {
    /** @type {boolean} success - True if the agent was successfully removed, false otherwise. */
    const success = await agentServices.removeAgent(agentId);
    res.status(200).json({ message: "Agent successfully removed!", success });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while removing the agent: ${error}`);
    res.status(status).json({
      message:
        "⚠️ An internal error occurred while removing the agent. Please try again later!",
      error: error.message,
    });
  }
};

exports.changeRoleToAgent = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await agentServices.changeToAgent(userId);
    res
      .status(200)
      .json({ message: "Change role to agent successfully!", user });
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error(`Internal error while changing user role to agent: ${error}`);
    res
      .status(status)
      .json({
        message: "Internal error while changing user role",
        error: error.message,
      });
  }
};
