const { Users } = require("../models");
const { ConflictError, NotFoundError } = require("../utils/error");

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
