const db = require('../../models');
const { Op } = require('sequelize');

const menuController = {
  async getAllMenus(req, res) {
    try {
      const { page = 1, limit = 10, search, restaurantId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      
      // Apply filters
      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }
      
      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      // For restaurant owners, only show their menus
      if (req.user.role === 'restaurant_owner') {
        const restaurants = await db.Restaurant.findAll({
          where: { userId: req.user.id },
          attributes: ['id']
        });
        const restaurantIds = restaurants.map(r => r.id);
        where.restaurantId = { [Op.in]: restaurantIds };
      }

      const { count, rows: menus } = await db.Menu.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: db.Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name', 'logoUrl']
          },
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          menus,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all menus error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menus'
      });
    }
  },

  async getMenu(req, res) {
    try {
      const { id } = req.params;

      const menu = await db.Menu.findByPk(id, {
        include: [
          {
            model: db.Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name', 'address', 'phone', 'logoUrl']
          },
          {
            model: db.Category,
            as: 'categories',
            include: [{
              model: db.Dish,
              as: 'dishes',
              include: [{
                model: db.Allergen,
                as: 'allergens',
                through: { attributes: [] }
              }]
            }]
          }
        ]
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found'
        });
      }

      // Check permissions
      if (req.user.role === 'restaurant_owner') {
        const restaurant = await db.Restaurant.findByPk(menu.restaurantId);
        if (restaurant.userId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this menu'
          });
        }
      }

      // Increment view count
      menu.viewsCount += 1;
      await menu.save();

      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu'
      });
    }
  },

  async createMenu(req, res) {
    try {
      const { title, restaurantId, description, styleConfig } = req.body;

      // Check if restaurant exists and user has access
      const restaurant = await db.Restaurant.findByPk(restaurantId);
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

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create menu
      const menu = await db.Menu.create({
        title,
        slug: `${slug}-${Date.now()}`,
        restaurantId,
        userId: req.user.id,
        description,
        styleConfig: styleConfig || {},
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        data: menu
      });
    } catch (error) {
      console.error('Create menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create menu'
      });
    }
  },

  async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const menu = await db.Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found'
        });
      }

      // Check permissions
      const restaurant = await db.Restaurant.findByPk(menu.restaurantId);
      if (req.user.role === 'restaurant_owner' && restaurant.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this menu'
        });
      }

      // Update menu
      await menu.update(updateData);

      res.json({
        success: true,
        message: 'Menu updated successfully',
        data: menu
      });
    } catch (error) {
      console.error('Update menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update menu'
      });
    }
  },

  async deleteMenu(req, res) {
    try {
      const { id } = req.params;

      const menu = await db.Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found'
        });
      }

      // Check permissions
      const restaurant = await db.Restaurant.findByPk(menu.restaurantId);
      if (req.user.role === 'restaurant_owner' && restaurant.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this menu'
        });
      }

      // Delete menu (soft delete by setting isActive to false)
      await menu.update({ isActive: false });

      res.json({
        success: true,
        message: 'Menu deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete menu'
      });
    }
  },

  async getPublicMenu(req, res) {
    try {
      const { slug } = req.params;

      const menu = await db.Menu.findOne({
        where: { 
          slug,
          isActive: true 
        },
        include: [
          {
            model: db.Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name', 'address', 'phone', 'logoUrl', 'colors']
          },
          {
            model: db.Category,
            as: 'categories',
            where: { isActive: true },
            required: false,
            include: [{
              model: db.Dish,
              as: 'dishes',
              where: { isAvailable: true },
              required: false,
              include: [{
                model: db.Allergen,
                as: 'allergens',
                through: { attributes: [] }
              }]
            }]
          }
        ]
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found'
        });
      }

      // Increment view count
      menu.viewsCount += 1;
      await menu.save();

      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      console.error('Get public menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu'
      });
    }
  }
};

module.exports = menuController;