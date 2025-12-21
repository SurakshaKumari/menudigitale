const express = require('express');
const router = express.Router();
const allergenController = require('../controllers/allergenController');
const authMiddleware = require('../middleware/authMiddleware');

// All allergen routes require authentication
router.use(authMiddleware);

// Get all allergens
router.get('/', allergenController.getAllAllergens);

// Get allergen by ID
router.get('/:id', allergenController.getAllergenById);

// Create allergen
router.post('/', allergenController.createAllergen);

// Update allergen
router.put('/:id', allergenController.updateAllergen);

// Delete allergen
router.delete('/:id', allergenController.deleteAllergen);

module.exports = router;