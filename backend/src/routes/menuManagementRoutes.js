const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menuCategoryController');
const menuItemController = require('../controllers/menuItemController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // For image uploads

// All routes require authentication
router.use(authMiddleware);

// ===== CATEGORY ROUTES =====
// Get all categories for a menu
router.get('/:menuId/categories', menuCategoryController.getMenuCategories);

// Create category
router.post('/:menuId/categories', menuCategoryController.createCategory);

// Update category
router.put('/categories/:id', menuCategoryController.updateCategory);

// Delete category
router.delete('/categories/:id', menuCategoryController.deleteCategory);

// Update category positions
router.put('/:menuId/categories/positions', menuCategoryController.updateCategoryPositions);

// ===== MENU ITEM ROUTES =====
// Get item by ID
router.get('/items/:id', menuItemController.getMenuItem);

// Create item in category
router.post('/categories/:categoryId/items', menuItemController.createMenuItem);

// Update item
router.put('/items/:id', menuItemController.updateMenuItem);

// Delete item
router.delete('/items/:id', menuItemController.deleteMenuItem);

// Update item positions
router.put('/categories/:categoryId/items/positions', menuItemController.updateItemPositions);

// Upload item image
router.post('/items/:id/image', upload.single('image'), menuItemController.uploadItemImage);

module.exports = router;