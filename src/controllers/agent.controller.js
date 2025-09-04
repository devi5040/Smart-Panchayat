const agentServices = require("../services/agent.services");
const logger = require("../utils/logger");

exports.createAgent = async (req, res) => {
  const { mobileNumber, name, latitude, longitude, languagePreference } =
    req.body;
  try {
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

exports.removeAgent = async (req, res) => {
  const { agentId } = req.params;
  try {
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
