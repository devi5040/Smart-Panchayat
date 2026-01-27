const { Op } = require('sequelize');
const { DeviceToken, Notifications, Users } = require('../models/index');
const admin = require('../config/firebase/firebase_config');

exports.saveToken = async (userId, token, platform) => {
  const tokenExists = await DeviceToken.findOne({ where: { userId } });
  if (tokenExists) {
    await DeviceToken.update({ token, platform }, { where: { userId } });
  } else {
    await DeviceToken.create({ userId, token, platform });
  }
  return true;
};

exports.notifyUsers = async (role, title, message, data = {}) => {
  let tokensData;
  if (role === 'all') {
    tokensData = await DeviceToken.findAll();
    const count = await DeviceToken.count();
  } else {
    const userIds = await Users.findAll({ where: { user_role: role }, attributes: ['id'] });
    const userIdsArr = userIds.map((u) => u.id);

    tokensData = await DeviceToken.findAll({
      where: {
        userId: { [Op.in]: userIdsArr },
      },
    });
  }

  const tokens = tokensData.map((token) => token.token);

  if (!tokens.length) {
    throw new Error('No tokens found for the given role');
  }

  const notificationMessage = {
    notification: { title, body: message },
    data,
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(notificationMessage);

  response.responses.forEach(async (r, index) => {
    if (!r.success) {
      //await DeviceToken.destroy({ where: { token: tokens[index] } });
      logger.error(`error is: ${JSON.stringify(r.error)}`);
    }
  });
  await Notifications.create({ title, message, role });
  return { success: true, sent: response.successCount, failed: response.failureCount };
};

exports.fetchNotifications = async (page, limit = 10) => {
  const pageNum = Number(page) || 1;
  const offset = (pageNum - 1) * Number(limit);

  const { count, rows: notifications } = await Notifications.findAndCountAll({
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  return { notifications, totalPages };
};
