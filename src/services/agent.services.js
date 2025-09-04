const { Users } = require("../models");
const {
  ConflictError,
  NotFoundError,
  NoContentError,
} = require("../utils/error");

exports.addAgent = async (
  mobileNumber,
  name,
  latitude,
  longitude,
  languagePreference
) => {
  const userExist = await Users.findOne({
    where: { phone_number: mobileNumber },
  });
  if (userExist) throw new ConflictError("User already exists");
  const user = await Users.create({
    phone_number: mobileNumber,
    user_name: name,
    latitude,
    longitude,
    language_preference: languagePreference,
    user_role: "agent",
  });
  if (!user) throw new Error("User not created");
  return user;
};

exports.removeAgent = async (agentId) => {
  const user = await Users.findByPk(agentId);
  if (!user) throw new NotFoundError("User not found!");
  if (user.user_role !== "agent")
    throw new Error("Given user is not an agent!");
  const numRowsDeleted = await Users.destroy({ where: { id: agentId } });
  if (numRowsDeleted === 0) throw new NotFoundError("Agent is not deleted!");
  return true;
};

exports.changeToAgent = async (userId) => {
  const user = await Users.findByPk(userId);
  if (!user) throw new NotFoundError("User not found!");
  const [numRowsUpdated] = await Users.update(
    { user_role: "agent" },
    { where: { id: userId } }
  );
  if (numRowsUpdated == 0) throw new NoContentError("No rows updated!");
  const data = await Users.findByPk(userId, {
    attributes: [
      "id",
      "user_name",
      "phone_number",
      "user_role",
      "language_preference",
    ],
  });
  return data;
};
