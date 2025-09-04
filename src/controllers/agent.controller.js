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
