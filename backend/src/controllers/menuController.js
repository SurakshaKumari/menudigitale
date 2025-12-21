const axios = require('axios');
const db = require('../../models');   // 👈 IMPORTANT
const { extractColorsFromImage } = require('../utils/colorExtractor');





const GOOGLE_API = 'https://maps.googleapis.com/maps/api/place';

module.exports = {

  // 1️⃣ SEARCH
  async searchRestaurant(req, res) {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Restaurant name required' });
    }

    const response = await axios.get(`${GOOGLE_API}/textsearch/json`, {
      params: {
        query: name,
        type: 'restaurant',
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    const results = response.data.results.map(p => ({
      placeId: p.place_id,
      name: p.name,
      address: p.formatted_address,
      logoUrl: p.photos?.length
        ? `${GOOGLE_API}/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        : null
    }));

    res.json({
      bestMatch: results[0] || null,
      alternatives: results.slice(1, 5)
    });
  },

  // 2️⃣ DETAILS
  async fetchRestaurantDetails(req, res) {
    const { placeId } = req.body;

    const response = await axios.get(`${GOOGLE_API}/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,photos',
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    const place = response.data.result;

    const logoUrl = place.photos?.length
      ? `${GOOGLE_API}/photo?maxwidth=600&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      : null;

    const colors = logoUrl ? await extractColorsFromImage(logoUrl) : null;

    res.json({
      menuData: {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        logoUrl,
        colors
      }
    });
  },

async createMenuFromGoogle(req, res) {
  try {
    console.log('🟢 createMenuFromGoogle called');
    console.log('🔍 Headers:', req.headers);
    console.log('👤 Request user:', req.user);
    console.log('🔐 Authorization header:', req.header('Authorization'));
    
    const { placeId, theme = 'light', background = '#ffffff' } = req.body;
    console.log('📦 Request body:', req.body);

    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }

    // Check if user exists
    if (!req.user || !req.user.id) {
      console.error('❌ User not found in request');
      return res.status(401).json({ 
        error: 'User not authenticated. Please login again.' 
      });
    }

    console.log('✅ User ID:', req.user.id);
    console.log('✅ User email:', req.user.email);
    console.log('✅ User restaurantId:', req.user.restaurantId);

    // 1️⃣ Fetch Google Place details
    const detailsRes = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,photos,geometry,address_components',
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }
    );

    const place = detailsRes.data.result;
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    console.log('📍 Google Place found:', place.name);

    // 2️⃣ Find or create Restaurant
    const [restaurant, created] = await db.Restaurant.findOrCreate({
      where: { googlePlaceId: placeId },
      defaults: {
        name: place.name || 'Unnamed Restaurant',
        address: place.formatted_address || '',
        phone: place.formatted_phone_number || '',
        website: place.website || '',
        latitude: place.geometry?.location?.lat || null,
        longitude: place.geometry?.location?.lng || null
      }
    });

    console.log('🏪 Restaurant:', restaurant.id, created ? '(Created)' : '(Existing)');

    // Ensure restaurant is a Sequelize instance
    let restaurantInstance = restaurant;
    if (!restaurant.get) {
      restaurantInstance = db.Restaurant.build(restaurant, { isNewRecord: false });
    }

    const restaurantId = restaurantInstance.id;
    if (!restaurantId) {
      console.error('❌ Restaurant ID not found');
      return res.status(500).json({ error: 'Failed to get restaurant ID' });
    }

    console.log('🏪 Restaurant ID:', restaurantId);

    // 3️⃣ logoUrl URL
    let logoUrlUrl = null;
    if (place.photos?.length) {
      logoUrlUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      console.log('🖼 logoUrl URL generated:', logoUrlUrl);
    }

    // 4️⃣ Extract colors safely
    let colors = { 
      primaryColor: theme === 'dark' ? '#3B82F6' : '#1E40AF', 
      backgroundColor: background,
      textColor: theme === 'dark' ? '#F9FAFB' : '#111827',
      accentColor: theme === 'dark' ? '#8B5CF6' : '#7C3AED'
    };
    
    if (logoUrlUrl) {
      try {
        console.log('🎨 Extracting colors from logoUrl...');
        const extractedColors = await extractColorsFromImage(logoUrlUrl);
        colors = { ...colors, ...extractedColors };
        console.log('✅ Colors extracted:', colors);
      } catch (err) {
        console.warn('⚠️ Color extraction failed:', err.message);
        console.log('🎨 Using default colors');
      }
    }

    // 5️⃣ Create Menu
    console.log('📝 Creating menu with data:', {
      restaurantId,
      userId: req.user.id,
      title: place.name,
      theme,
      background
    });

    const menu = await db.Menu.create({
      restaurantId: restaurantId,
      userId: req.user.id,
      title: place.name || 'New Menu',
      description: `Menu for ${place.name}`,
      styleConfig: { 
        ...colors, 
        theme, 
        backgroundColor: background,
        fontFamily: 'Inter, sans-serif'
      },
      isActive: true,
      metadata: { 
        source: 'google', 
        googlePlaceId: placeId, 
        importedAt: new Date(),
        address: place.formatted_address || '',
        phone: place.formatted_phone_number || '',
        website: place.website || ''
      }
    });

    console.log('✅ Menu created successfully:', menu.id);

    // 6️⃣ Create default menu sections (CHECK IF MenuSection MODEL EXISTS)
    try {
      console.log('📋 Creating default sections...');
      
      // Option 1: If MenuSection model exists
      if (db.MenuSection) {
        const defaultSections = [
          { name: 'Appetizers', description: 'Start your meal right', position: 1 },
          { name: 'Main Course', description: 'Hearty main dishes', position: 2 },
          { name: 'Desserts', description: 'Sweet endings', position: 3 },
          { name: 'Drinks', description: 'Refreshing beverages', position: 4 }
        ];

        for (const sectionData of defaultSections) {
          await db.MenuSection.create({
            menuId: menu.id,
            ...sectionData,
            isActive: true
          });
        }
        console.log('✅ Default sections created using MenuSection model');
      } 
      // Option 2: If MenuSection doesn't exist, create items directly
      else if (db.MenuItem) {
        console.log('⚠️ MenuSection model not found, creating items directly');
        
        const defaultItems = [
          { name: 'Sample Appetizer', description: 'A delicious starter', price: 8.99, category: 'Appetizers', position: 1 },
          { name: 'Sample Main Course', description: 'A hearty main dish', price: 16.99, category: 'Main Course', position: 2 },
          { name: 'Sample Dessert', description: 'A sweet treat', price: 6.99, category: 'Desserts', position: 3 },
          { name: 'Sample Drink', description: 'Refreshing beverage', price: 4.99, category: 'Drinks', position: 4 }
        ];

        for (const itemData of defaultItems) {
          await db.MenuItem.create({
            menuId: menu.id,
            ...itemData,
            isAvailable: true
          });
        }
        console.log('✅ Default items created using MenuItem model');
      } 
      // Option 3: Skip if neither model exists
      else {
        console.log('⚠️ Neither MenuSection nor MenuItem model found. Skipping default content creation.');
      }
    } catch (sectionError) {
      console.warn('⚠️ Failed to create default sections/items:', sectionError.message);
      console.log('⚠️ Continuing without default sections...');
      // Don't fail the entire request if sections fail
    }

    // 7️⃣ Return success response
    return res.status(201).json({ 
      success: true, 
      message: 'Menu created successfully',
      data: {
        menu: {
          id: menu.id,
          title: menu.title,
          restaurantId: menu.restaurantId,
          theme: menu.styleConfig.theme,
          createdAt: menu.createdAt
        },
        restaurant: {
          id: restaurantId,
          name: restaurantInstance.name,
          address: restaurantInstance.address
        }
      }
    });

  } catch (err) {
    console.error('❌ createMenuFromGoogle error:', err);
    console.error('❌ Error stack:', err.stack);
    
    // Specific error handling
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'A menu for this restaurant already exists' 
      });
    }
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Invalid restaurant or user reference' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create menu',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
},

// controllers/menuController.js - FIXED VERSION WITH CORRECT MODEL NAMES
async getAllMenus(req, res) {
  try {
    console.log('🟢 getAllMenus called');
    console.log('👤 User:', req.user.id);

    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {
      userId: req.user.id
    };

    // Filter by status if provided
    if (status) {
      if (status === 'active') {
        whereConditions.isActive = true;
      } else if (status === 'inactive') {
        whereConditions.isActive = false;
      }
    }

    // Search by menu title or description
    if (search && search.trim() !== '') {
      const { Op } = db.Sequelize;
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count for pagination
    const totalMenus = await db.Menu.count({
      where: whereConditions
    });

    // Fetch menus WITH CORRECT ASSOCIATIONS
    const menus = await db.Menu.findAll({
      where: whereConditions,
      include: [
        {
          model: db.Restaurant,
          as: 'Restaurant', // Match your association alias
          attributes: ['id', 'name', 'address', 'phone', 'website', 'logoUrl']
        },
        {
          model: db.MenuCategory,
          as: 'MenuCategories', // Match your association alias
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: db.MenuItem,
          as: 'MenuItems', // Match your association alias (if exists)
          attributes: ['id'],
          required: false
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    // Format the response
    const formattedMenus = menus.map(menu => {
      // Get category and item counts
      const categoryCount = menu.MenuCategories ? menu.MenuCategories.length : 0;
      const itemCount = menu.MenuItems ? menu.MenuItems.length : 0;

      // Get view count from statistics if available
      const viewCount = menu.metadata?.statistics?.views || 0;
      const qrScans = menu.metadata?.statistics?.qrScans || 0;

      return {
        id: menu.id,
        title: menu.title,
        description: menu.description,
        status: menu.isActive ? 'active' : 'inactive',
        theme: menu.styleConfig?.theme || 'light',
        backgroundColor: menu.styleConfig?.backgroundColor || '#ffffff',
        primaryColor: menu.styleConfig?.primaryColor || '#0A0C0B',
        logoUrl: menu.Restaurant?.logoUrl || null,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        statistics: {
          categories: categoryCount,
          dishes: itemCount,
          views: viewCount,
          qrScans: qrScans
        },
        restaurant: menu.Restaurant ? {
          id: menu.Restaurant.id,
          name: menu.Restaurant.name,
          address: menu.Restaurant.address,
          phone: menu.Restaurant.phone
        } : null
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalMenus / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: 'Menus retrieved successfully',
      data: {
        menus: formattedMenus,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMenus,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (err) {
    console.error('❌ getAllMenus error:', err);
    console.error('❌ Error stack:', err.stack);

    // If include fails, try the simple version
    try {
      console.log('🔄 Trying simplified version...');
      
      const whereConditions = {
        userId: req.user.id
      };
      
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const totalMenus = await db.Menu.count({
        where: whereConditions
      });

      const menus = await db.Menu.findAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      const formattedMenus = await Promise.all(menus.map(async (menu) => {
        // Get restaurant
        const restaurant = menu.restaurantId ? await db.Restaurant.findByPk(menu.restaurantId, {
          attributes: ['id', 'name', 'address', 'phone', 'logoUrl']
        }) : null;

        // Get category count
        const categoryCount = await db.MenuCategory.count({
          where: { menuId: menu.id }
        });

        // Get item count
        const itemCount = await db.MenuItem.count({
          where: { categoryId: menu.id } // This might need adjustment
        });

        return {
          id: menu.id,
          title: menu.title,
          description: menu.description,
          status: menu.isActive ? 'active' : 'inactive',
          theme: menu.styleConfig?.theme || 'light',
          backgroundColor: menu.styleConfig?.backgroundColor || '#ffffff',
          primaryColor: menu.styleConfig?.primaryColor || '#0A0C0B',
          logoUrl: restaurant?.logoUrl || null,
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt,
          statistics: {
            categories: categoryCount,
            dishes: itemCount,
            views: 0,
            qrScans: 0
          },
          restaurant: restaurant ? {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone
          } : null
        };
      }));

      const totalPages = Math.ceil(totalMenus / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        message: 'Menus retrieved successfully (simplified)',
        data: {
          menus: formattedMenus,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalMenus,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (simpleErr) {
      console.error('❌ Simplified version also failed:', simpleErr);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch menus',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
},

  // ======================
  // 🔍 GET SINGLE MENU DETAILS (FIXED VERSION)
  // ======================
  async getMenuById(req, res) {
    try {
      console.log('🟢 getMenuById called');
      console.log('👤 User:', req.user.id);
      console.log('📋 Menu ID:', req.params.id);

      const menuId = req.params.id;

      // First get the menu
      const menu = await db.Menu.findOne({
        where: {
          id: menuId,
          userId: req.user.id // Ensure user owns this menu
        }
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found or you do not have permission to access it'
        });
      }

      // Get restaurant if exists
      let restaurant = null;
      if (menu.restaurantId) {
        restaurant = await db.Restaurant.findByPk(menu.restaurantId, {
          attributes: ['id', 'name', 'address', 'phone', 'website', 'logoUrl', 'googlePlaceId']
        });
      }

      // Get sections if MenuSection model exists
      let sections = [];
      if (db.MenuSection) {
        try {
          const menuSections = await db.MenuSection.findAll({
            where: { menuId: menu.id },
            attributes: ['id', 'name', 'description', 'position', 'isActive'],
            order: [['position', 'ASC']]
          });

          // Get items for each section if MenuItem model exists
          if (db.MenuItem) {
            for (const section of menuSections) {
              const items = await db.MenuItem.findAll({
                where: { 
                  menuId: menu.id,
                  // If you have category field in MenuItem
                  // category: section.name 
                },
                attributes: ['id', 'name', 'description', 'price', 'image', 'isAvailable', 'position'],
                order: [['position', 'ASC']]
              });

              sections.push({
                id: section.id,
                name: section.name,
                description: section.description,
                position: section.position,
                isActive: section.isActive,
                items: items.map(item => ({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  image: item.image,
                  isAvailable: item.isAvailable,
                  position: item.position,
                  allergens: [] // You'll need to fetch allergens separately if needed
                }))
              });
            }
          } else {
            // If no MenuItem model, just return sections
            sections = menuSections.map(section => ({
              id: section.id,
              name: section.name,
              description: section.description,
              position: section.position,
              isActive: section.isActive,
              items: []
            }));
          }
        } catch (err) {
          console.log(`⚠️ Could not fetch sections for menu ${menu.id}:`, err.message);
        }
      }

      // Get allergens if Allergen model exists (assuming junction table)
      let allergens = [];
      if (db.Allergen) {
        try {
          // This depends on your relationship setup
          // You might need to adjust this based on your actual schema
          allergens = await db.Allergen.findAll({
            // Add your conditions here based on your schema
            attributes: ['id', 'name', 'code', 'icon']
          });
        } catch (err) {
          console.log(`⚠️ Could not fetch allergens for menu ${menu.id}:`, err.message);
        }
      }

      // Format the response
      const formattedMenu = {
        id: menu.id,
        title: menu.title,
        description: menu.description,
        isActive: menu.isActive,
        styleConfig: menu.styleConfig || {},
        metadata: menu.metadata || {},
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          website: restaurant.website,
          logoUrl: restaurant.logoUrl,
          googlePlaceId: restaurant.googlePlaceId
        } : null,
        sections: sections,
        allergens: allergens
      };

      return res.status(200).json({
        success: true,
        message: 'Menu retrieved successfully',
        data: formattedMenu
      });

    } catch (err) {
      console.error('❌ getMenuById error:', err);
      console.error('❌ Error stack:', err.stack);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch menu details',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // ======================
  // 🔄 UPDATE MENU (SAME AS BEFORE)
  // ======================
  async updateMenu(req, res) {
    try {
      console.log('🟢 updateMenu called');
      console.log('👤 User:', req.user.id);
      console.log('📋 Menu ID:', req.params.id);
      console.log('📝 Update data:', req.body);

      const menuId = req.params.id;
      const updateData = req.body;

      // First, verify menu exists and belongs to user
      const menu = await db.Menu.findOne({
        where: {
          id: menuId,
          userId: req.user.id
        }
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found or you do not have permission to update it'
        });
      }

      // Fields that can be updated
      const allowedFields = ['title', 'description', 'isActive', 'styleConfig', 'metadata'];
      const updates = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'styleConfig' || field === 'metadata') {
            // Merge with existing config
            updates[field] = { ...menu[field], ...updateData[field] };
          } else {
            updates[field] = updateData[field];
          }
        }
      });

      // Add updatedAt timestamp
      updates.updatedAt = new Date();

      // Perform update
      await db.Menu.update(updates, {
        where: { id: menuId }
      });

      // Fetch updated menu
      const updatedMenu = await db.Menu.findByPk(menuId);

      return res.status(200).json({
        success: true,
        message: 'Menu updated successfully',
        data: {
          id: updatedMenu.id,
          title: updatedMenu.title,
          description: updatedMenu.description,
          isActive: updatedMenu.isActive,
          styleConfig: updatedMenu.styleConfig,
          updatedAt: updatedMenu.updatedAt
        }
      });

    } catch (err) {
      console.error('❌ updateMenu error:', err);
      console.error('❌ Error stack:', err.stack);

      return res.status(500).json({
        success: false,
        error: 'Failed to update menu',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // ======================
  // 🗑️ DELETE MENU (SAME AS BEFORE)
  // ======================
  async deleteMenu(req, res) {
    try {
      console.log('🟢 deleteMenu called');
      console.log('👤 User:', req.user.id);
      console.log('📋 Menu ID:', req.params.id);

      const menuId = req.params.id;

      // First, verify menu exists and belongs to user
      const menu = await db.Menu.findOne({
        where: {
          id: menuId,
          userId: req.user.id
        }
      });

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: 'Menu not found or you do not have permission to delete it'
        });
      }

      // Soft delete (set isActive to false)
      await db.Menu.update(
        { isActive: false, updatedAt: new Date() },
        { where: { id: menuId } }
      );

      return res.status(200).json({
        success: true,
        message: 'Menu deactivated successfully'
      });

    } catch (err) {
      console.error('❌ deleteMenu error:', err);
      console.error('❌ Error stack:', err.stack);

      return res.status(500).json({
        success: false,
        error: 'Failed to delete menu',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // ======================
  // 📊 GET MENU STATISTICS (FIXED VERSION)
  // ======================
  async getMenuStatistics(req, res) {
    try {
      console.log('🟢 getMenuStatistics called');
      console.log('👤 User:', req.user.id);

      // Get total counts
      const totalMenus = await db.Menu.count({
        where: { userId: req.user.id }
      });

      const activeMenus = await db.Menu.count({
        where: {
          userId: req.user.id,
          isActive: true
        }
      });

      // Get all menus to calculate items and categories
      const menus = await db.Menu.findAll({
        where: { userId: req.user.id },
        attributes: ['id']
      });

      let totalCategories = 0;
      let totalDishes = 0;

      // Calculate categories and dishes for each menu
      for (const menu of menus) {
        try {
          if (db.MenuSection) {
            const categoryCount = await db.MenuSection.count({
              where: { menuId: menu.id }
            });
            totalCategories += categoryCount;
          }
        } catch (err) {
          console.log(`⚠️ Could not count categories for menu ${menu.id}:`, err.message);
        }

        try {
          if (db.MenuItem) {
            const dishCount = await db.MenuItem.count({
              where: { menuId: menu.id }
            });
            totalDishes += dishCount;
          }
        } catch (err) {
          console.log(`⚠️ Could not count dishes for menu ${menu.id}:`, err.message);
        }
      }

      // Get view statistics from metadata if available
      let totalViews = 0;
      let totalQrScans = 0;

      const menusWithMetadata = await db.Menu.findAll({
        where: { userId: req.user.id },
        attributes: ['metadata']
      });

      menusWithMetadata.forEach(menu => {
        const metadata = menu.metadata || {};
        totalViews += metadata.statistics?.views || 0;
        totalQrScans += metadata.statistics?.qrScans || 0;
      });

      return res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: {
          totalMenus,
          activeMenus,
          inactiveMenus: totalMenus - activeMenus,
          totalCategories,
          totalDishes,
          totalViews,
          totalQrScans,
          averageDishesPerMenu: totalMenus > 0 ? (totalDishes / totalMenus).toFixed(1) : 0,
          averageCategoriesPerMenu: totalMenus > 0 ? (totalCategories / totalMenus).toFixed(1) : 0
        }
      });

    } catch (err) {
      console.error('❌ getMenuStatistics error:', err);
      console.error('❌ Error stack:', err.stack);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },


};
