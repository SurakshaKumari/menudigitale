const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
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
    logging: false,
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
const frontendBuildPath = path.join(__dirname, "../../frontend/build");
const fs = require("fs");

if (fs.existsSync(frontendBuildPath)) {
  console.log(`📁 Serving frontend from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
}

// Test database connection
sequelize.authenticate()
  .then(() => console.log('✅ Database Connected'))
  .catch(err => console.error('❌ Database Error:', err.message));

// API Routes
app.get("/api/status", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Menu Digitale API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: "healthy", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: "degraded", 
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ 
    error: "API endpoint not found",
    path: req.path 
  });
});

// Serve React app for the root route
app.get("/", (req, res) => {
  if (fs.existsSync(frontendBuildPath)) {
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  }
  res.send('<h1>Menu Digitale Backend Running</h1><p>Frontend not built</p>');
});

// For React Router - serve index.html for all client-side routes
// Use a regex to match all routes except /api/*
app.get(/^(?!\/api).*$/, (req, res) => {
  if (fs.existsSync(frontendBuildPath)) {
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  }
  res.status(404).send('Route not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (fs.existsSync(frontendBuildPath)) {
    console.log(`🌐 Frontend: Served from ${frontendBuildPath}`);
  } else {
    console.log(`⚠️ Frontend: Build not found`);
  }
});