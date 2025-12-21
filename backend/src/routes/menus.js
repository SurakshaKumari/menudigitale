// In your routes file (routes/menu.js or similar)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const menuController = require('../controllers/menuController');

// Apply auth middleware to all menu routes
router.use(authMiddleware);

// OR apply to specific routes
router.post('/create', authMiddleware, menuController.createMenuFromGoogle);
router.post('/search', authMiddleware, menuController.searchRestaurant);
router.post('/details', authMiddleware, menuController.fetchRestaurantDetails);
router.get('/all', menuController.getAllMenus);

// 📋 GET MENU STATISTICS
router.get('/statistics', menuController.getMenuStatistics);

// 🔍 GET SINGLE MENU DETAILS
router.get('/:id', menuController.getMenuById);

// ✏️ UPDATE MENU
router.put('/:id', menuController.updateMenu);

// 🗑️ DELETE MENU (soft delete)
router.delete('/:id', menuController.deleteMenu);



module.exports = router;


