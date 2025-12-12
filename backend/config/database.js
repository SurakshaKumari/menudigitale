// config/database.js
const databaseConfig = {
  development: {
    username: process.env.DB_USER || 'cP6EVeT3HX',
    password: process.env.DB_PASSWORD || 'SA+faTa788Ub6Zg',
    database: process.env.DB_NAME || 'menu_ai_db',
    host: process.env.DB_HOST || 'phpmyadmin.kmzerowebmarketing.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Disable logging in production
    pool: {
      max: 20, // Increase for production
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    // Add SSL if required by your hosting
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = databaseConfig[env];