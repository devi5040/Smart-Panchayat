const { Sequelize } = require('sequelize');
require('../models');

const sequelize = new Sequelize(
  process.env.TEST_DB_NAME,
  process.env.TEST_DB_USERNAME,
  process.env.TEST_DB_PASSWORD,
  { dialect: 'mysql', host: process.env.TEST_DB_HOST },
);

// Function to initialize DB before tests
const initializeTestDB = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true, alter: true });
};
global.sequelize = sequelize;

// Function to clear tables after each test
const clearTestDB = async () => {
  await Promise.all(
    Object.values(sequelize.models).map((model) => model.destroy({ where: {}, truncate: true })),
  );
};

// Function to close DB connection after all tests
const closeTestDB = async () => {
  await sequelize.close();
};

let transaction;

// Start a transaction before each test
const startTransaction = async () => {
  transaction = await sequelize.transaction();
};

// Rollback the transaction after each test
const rollbackTransaction = async () => {
  if (transaction) await transaction.rollback();
};

console.log(process.env.TEST_DB_HOST);
console.log(process.env.TEST_DB_NAME);
console.log(process.env.TEST_DB_PASSWORD);
console.log(process.env.TEST_DB_USERNAME);

module.exports = {
  sequelize,
  initializeTestDB,
  clearTestDB,
  closeTestDB,
  startTransaction,
  rollbackTransaction,
};
