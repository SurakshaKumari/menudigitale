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
app.use(helmet({
  contentSecurityPolicy: false, // Adjust based on your frontend needs
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
// Try multiple possible frontend build locations
const frontendPaths = [
  path.join(__dirname, "../../frontend/build"),      // React/Vue build
  path.join(__dirname, "../../frontend/dist"),       // Vue/Angular dist
  path.join(__dirname, "../../frontend/public"),     // Public folder
  path.join(__dirname, "../public"),                 // Backend public folder
];

// Use the first existing frontend build path
let staticPath = null;
for (const frontendPath of frontendPaths) {
  try {
    const fs = require("fs");
    if (fs.existsSync(frontendPath)) {
      staticPath = frontendPath;
      console.log(`📁 Serving frontend from: ${frontendPath}`);
      app.use(express.static(frontendPath));
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

// Test database connection on startup
sequelize.authenticate()
  .then(() => console.log('✅ MySQL Database Connected Successfully'))
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    console.log('⚠️ App will run without database connection');
  });

// API Routes (these should come before the catch-all route)
app.get("/api/status", (req, res) => {
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

// Catch-all route to serve frontend (MUST be after all API routes)
if (staticPath) {
  app.get("*", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    const fs = require("fs");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // If no index.html found, check for other HTML files
      const htmlFiles = fs.readdirSync(staticPath).filter(file => file.endsWith('.html'));
      if (htmlFiles.length > 0) {
        res.sendFile(path.join(staticPath, htmlFiles[0]));
      } else {
        // If no HTML files, return API info
        res.json({
          status: "running",
          message: "Backend API is running but frontend files not found",
          frontendExpectedAt: staticPath,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
} else {
  // If no frontend build found, show info message
  app.get("*", (req, res) => {
    if (req.path === "/" || req.path === "/api") {
      res.json({ 
        status: "running", 
        message: "Menu Digitale Backend API is running",
        timestamp: new Date().toISOString(),
        note: "Frontend files not found. Check if frontend is built and placed correctly.",
        frontendExpectedPaths: frontendPaths.map(p => path.relative(__dirname, p))
      });
    } else {
      res.status(404).json({ 
        status: "error", 
        message: "Route not found",
        timestamp: new Date().toISOString()
      });
    }
  });
}

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
  if (staticPath) {
    console.log(`🌐 Frontend being served from: ${path.relative(__dirname, staticPath)}`);
  } else {
    console.log(`⚠️ No frontend build found. Checking paths:`);
    frontendPaths.forEach(p => console.log(`   - ${path.relative(__dirname, p)}`));
  }
});

module.exports = app;