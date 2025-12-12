// models/index.js - SIMPLE WORKING VERSION
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();
const config = require('../config/database');

// Database configuration
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

// Load ONLY the User model for now
try {
  console.log('📦 Loading User model...');
  const UserModel = require('./user');
  db.User = UserModel(sequelize, DataTypes);
  console.log('✅ User model loaded');
} catch (error) {
  console.error('❌ Failed to load User model:', error.message);
}

// Skip associations for now
// db.User.associate = function(models) {
//   // Empty function to avoid errors
// };

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('🎯 Available models:', Object.keys(db));

module.exports = db;