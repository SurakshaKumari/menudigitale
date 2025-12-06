"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts
const express_1 = require("express");
const cors_1 = require("cors");
const helmet_1 = require("helmet");
const compression_1 = require("compression");
const dotenv_1 = require("dotenv");
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Database connection
database_1.sequelize.authenticate()
    .then(() => console.log('✅ MySQL Database Connected'))
    .catch(err => console.error('❌ Database Connection Error:', err));
// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Menu Digitale API is running',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
