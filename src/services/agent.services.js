const { Users } = require("../models");
const { ConflictError } = require("../utils/error");

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
