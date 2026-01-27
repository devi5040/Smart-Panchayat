const services = require('../services/notifications.service');
const logger = require('../utils/logger');

exports.saveToken = async (req, res) => {
  const userId = req.user.id;
  const { deviceToken, platform } = req.body;
  try {
    const success = await services.saveToken(userId, deviceToken, platform);
    res.status(201).json({ message: 'Token saved successfully', success });
  } catch (error) {
    logger.error(`Internal error while saving the token: ${error}`);
    res.status(500).json({ message: 'Internal error while saving the token' });
  }
};

exports.notifyUsers = async (req, res) => {
  const { role, title, message, data } = req.body;
  try {
    const { success, sent, failed } = await services.notifyUsers(role, title, message, data);
    res.status(200).json({ message: 'Notification sent successfully', success, sent, failed });
  } catch (error) {
    logger.error(`Internal error while sending the notification: ${error}`);
    res.status(500).json({ message: 'Internal error while sending the notification' });
  }
};

exports.fetchNotifications = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const { notifications, totalPages } = await services.fetchNotifications(page, limit);
    res
      .status(200)
      .json({ message: 'Notifications fetched successfully', notifications, totalPages });
  } catch (error) {
    logger.error(`Internal error while fetching the notifications: ${error}`);
    res.status(500).json({ message: 'Internal error while fetching the notifications' });
  }
};
