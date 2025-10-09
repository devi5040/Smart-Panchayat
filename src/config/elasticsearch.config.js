const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTIC_URL,
  tls: { rejectUnauthorized: false },
});

module.exports = client;
