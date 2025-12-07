const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'menu_ai_db',
  process.env.DB_USER || 'cP6EVeT3HX',
  process.env.DB_PASSWORD || 'SA+faTa788Ub6Zg',
  {
    host: process.env.DB_HOST || 'phpmyadmin.kmzerowebmarketing.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    dialectOptions: {
      connectTimeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
sequelize.authenticate()
  .then(() => console.log('✅ MySQL Database Connected Successfully'))
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    console.log('⚠️ App will run without database connection');
  });

// Routes
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Menu Digitale API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      connected: true,
      host: process.env.DB_HOST,
      name: process.env.DB_NAME
    }
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: "healthy", 
      message: "API is running",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: "degraded", 
      message: "API is running but database is disconnected",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️ Database: ${process.env.DB_HOST}`);
});

module.exports = app;