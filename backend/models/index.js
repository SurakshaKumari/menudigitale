'use strict';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    dialectOptions: config.dialOptions || {}
  }
);

const db = {};

// Load all models
['user', 'restaurant', 'menu'].forEach(modelFile => {
  const model = require(`./${modelFile}`)(sequelize, DataTypes);
  db[model.name] = model;
});

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('🎯 Available models:', Object.keys(db));

module.exports = db;
