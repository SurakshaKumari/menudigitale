const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { validateMenu } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

// Public route (for menu display)
router.post('/search-restaurant', authenticate, menuController.searchRestaurant);


// router.get('/public/:slug', menuController.getPublicMenu);

// // Protected routes
// router.get('/', authenticate, menuController.getAllMenus);
// router.get('/:id', authenticate, menuController.getMenu);
// router.post('/', authenticate, validateMenu, menuController.createMenu);
// router.put('/:id', authenticate, menuController.updateMenu);
// router.delete('/:id', authenticate, menuController.deleteMenu);

// // Admin only routes
// router.get('/admin/all', authenticate, authorize('admin'), menuController.getAllMenus);

module.exports = router;