/**
 * @filename agent.services.js
 * @description This file provides backend services for managing agents within the application.  It handles the creation of new agent accounts,
 * deletion of existing agent accounts, and the modification of user roles to assign agent status.  The services interact with a user database
 * model to perform these operations and leverage custom error handling for various scenarios, including conflicts, missing users, and update
 * failures.
 *
 * @version v1.0.0
 * @updated Sep 4, 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

const { Users } = require('../models');
const { ConflictError, NotFoundError, NoContentError } = require('../utils/error');

/**
 * Adds a new agent to the database.
 * @async
 * @param {string} mobileNumber - The agent's mobile number.
 * @param {string} name - The agent's name.
 * @param {number} latitude - The agent's latitude.
 * @param {number} longitude - The agent's longitude.
 * @param {string} languagePreference - The agent's preferred language.
 * @throws {ConflictError} If a user with the same mobile number already exists.
 * @throws {Error} If the user creation fails.
 * @returns {Promise<object>} The newly created agent object.  Returns the Sequelize instance of the created User.
 */
exports.addAgent = async (
  mobileNumber,
  name,
  latitude,
  longitude,
  languagePreference,
  collectionCentreId,
) => {
  const userExist = await Users.findOne({
    where: { phone_number: mobileNumber },
  });
  if (userExist) throw new ConflictError('User already exists');
  const user = await Users.create({
    phone_number: mobileNumber,
    user_name_en: name,
    user_name_kn: name,
    latitude,
    longitude,
    language_preference: languagePreference,
    user_role: 'agent',
    collectionCentreId,
  });
  if (!user) throw new Error('User not created');
  return user;
};

/**
 * Removes an agent from the database.
 * @async
 * @param {number} agentId - The ID of the agent to remove.
 * @throws {NotFoundError} If the agent is not found or if the deletion fails.
 * @throws {Error} If the user to be deleted is not an agent.
 * @returns {Promise<boolean>} True if the agent was successfully removed, otherwise throws an error.
 */
exports.removeAgent = async (agentId) => {
  const user = await Users.findByPk(agentId);
  if (!user) throw new NotFoundError('User not found!');
  if (user.user_role !== 'agent') throw new Error('Given user is not an agent!');
  const numRowsDeleted = await Users.destroy({ where: { id: agentId } });
  if (numRowsDeleted === 0) throw new NotFoundError('Agent is not deleted!');
  return true;
};

/**
 * Changes a user's role to "agent".
 * @async
 * @param {number} userId - The ID of the user to change.
 * @throws {NotFoundError} If the user is not found.
 * @throws {NoContentError} If no rows were updated.
 * @returns {Promise<object>} The updated user object with specific attributes. Returns the Sequelize instance of the updated User.
 */
exports.changeToAgent = async (userId, collectionCentreId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError('User not found!');
  const [numRowsUpdated] = await Users.update(
    { user_role: 'agent', collectionCentreId },
    { where: { id: userId } },
  );
  if (numRowsUpdated == 0) throw new NoContentError('No rows updated!');
  const data = await Users.findByPk(userId, {
    attributes: [
      'id',
      'user_name_en',
      'user_name_kn',
      'phone_number',
      'user_role',
      'language_preference',
    ],
  });
  return data;
};
