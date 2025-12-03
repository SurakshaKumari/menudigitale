// backend/src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  isProduction ? process.env.PROD_DB_NAME! : process.env.DB_NAME!,
  isProduction ? process.env.PROD_DB_USER! : process.env.DB_USER!,
  isProduction ? process.env.PROD_DB_PASS! : process.env.DB_PASS!,
  {
    host: isProduction ? process.env.PROD_DB_HOST! : process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

export { sequelize };