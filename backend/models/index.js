// models/index.js - SIMPLE WORKING VERSION
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'menu_ai_db',
  process.env.DB_USER || 'cP6EVeT3HX',
  process.env.DB_PASSWORD || 'SA+faTa788Ub6Zg',
  {
    host: process.env.DB_HOST || 'phpmyadmin.kmzerowebmarketing.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Enable logging to debug
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
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