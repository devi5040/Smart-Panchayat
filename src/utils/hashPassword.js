const bcrypt = require("bcrypt");

exports.encryptPassword = (password) => {
  return bcrypt.hash(password, 12);
};

exports.comparePasswords = (newPassword, oldPassword) => {
  return bcrypt.compare(newPassword, oldPassword);
};
