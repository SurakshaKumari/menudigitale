const db = require('../../models');

const restaurantController = {
  async getAllRestaurants(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      
      // For restaurant owners, only show their restaurants
      if (req.user.role === 'restaurant_owner') {
        where.userId = req.user.id;
      }

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const { count, rows: restaurants } = await db.Restaurant.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          restaurants,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get restaurants error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurants'
      });
    }
  },

  async getRestaurant(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await db.Restaurant.findByPk(id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: db.Menu,
            as: 'menus',
            where: { isActive: true },
            required: false
          }
        ]
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      // Check permissions
      if (req.user.role === 'restaurant_owner' && restaurant.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this restaurant'
        });
      }

      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      console.error('Get restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurant'
      });
    }
  },

  async createRestaurant(req, res) {
    try {
      const { name, address, city, phone, email, website, logoUrl } = req.body;

      const restaurant = await db.Restaurant.create({
        userId: req.user.id,
        name,
        address,
        city,
        phone,
        email,
        website,
        logoUrl,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant
      });
    } catch (error) {
      console.error('Create restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create restaurant'
      });
    }
  },

  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const restaurant = await db.Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      // Check permissions
      if (req.user.role === 'restaurant_owner' && restaurant.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this restaurant'
        });
      }

      // Update restaurant
      await restaurant.update(updateData);

      res.json({
        success: true,
        message: 'Restaurant updated successfully',
        data: restaurant
      });
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update restaurant'
      });
    }
  },

  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await db.Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      // Check permissions
      if (req.user.role === 'restaurant_owner' && restaurant.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this restaurant'
        });
      }

      // Soft delete
      await restaurant.update({ isActive: false });

      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      console.error('Delete restaurant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete restaurant'
      });
    }
  }
};

module.exports = restaurantController;