const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import models - this creates the Sequelize connection
const db = require('../models');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://menudigitale.kmzerowebmarketing.com' ,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
const frontendBuildPath = path.join(__dirname, "../../frontend/build");
const fs = require("fs");

if (fs.existsSync(frontendBuildPath)) {
  console.log(`📁 Serving frontend from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
}

// Test database connection using the models' sequelize instance
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database Connected');
    
    // Sync database (optional - can be removed in production)
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database synced');
  })
  .catch(err => {
    console.error('❌ Database Error:', err.message);
  });

// Debug: Check if models are loaded
console.log('Available models:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));
console.log('User model exists?', !!db.User);

// ========== IMPORT AUTH ROUTES ==========
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ========== EXISTING ROUTES ==========
app.get("/api/status", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Menu Digitale API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await db.sequelize.authenticate(); // Use db.sequelize
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

// Test route to check model functionality
app.get("/api/test-model", async (req, res) => {
  try {
    const userCount = await db.User.count();
    res.json({
      success: true,
      message: 'Model test successful',
      data: {
        userCount,
        models: Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key))
      }
    });
  } catch (error) {
    console.error('Model test error:', error);
    res.status(500).json({
      success: false,
      error: 'Model test failed',
      details: error.message
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
app.get(/^(?!\/api).*$/, (req, res) => {
  if (fs.existsSync(frontendBuildPath)) {
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  }
  res.status(404).send('Route not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔑 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Health check: GET http://localhost:${PORT}/api/health`);
  console.log(`🔧 Model test: GET http://localhost:${PORT}/api/test-model`);
  console.log(`\n📝 Using real JWT tokens for authentication`);
  
  if (fs.existsSync(frontendBuildPath)) {
    console.log(`\n📁 Frontend: Served from ${frontendBuildPath}`);
  } else {
    console.log(`\n⚠️ Frontend: Build not found at ${frontendBuildPath}`);
  }
});