const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, restaurantController.getAllRestaurants);
router.get('/:id', authenticate, restaurantController.getRestaurant);
router.post('/', authenticate, restaurantController.createRestaurant);
router.put('/:id', authenticate, restaurantController.updateRestaurant);
router.delete('/:id', authenticate, restaurantController.deleteRestaurant);

module.exports = router;