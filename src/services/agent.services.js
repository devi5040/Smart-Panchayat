const { Users } = require("../models");
const { ConflictError } = require("../utils/error");

exports.addAgent = async (
  mobileNumber,
  name,
  latitude,
  longitude,
  language
) => {
  const userExist = await Users.findOne({ where: { mobileNumber } });
  if (userExist) throw new ConflictError("User already exists");
  const user = await Users.create({
    mobileNumber,
    name,
    latitude,
    longitude,
    language_preference: language,
    role: "agent",
  });
  if (!user) throw new Error("User not created");
  return user;
};
