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
      logo: p.photos?.length
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

    const logo = place.photos?.length
      ? `${GOOGLE_API}/photo?maxwidth=600&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      : null;

    const colors = logo ? await extractColorsFromImage(logo) : null;

    res.json({
      menuData: {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        logo,
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

    // 3️⃣ Logo URL
    let logoUrl = null;
    if (place.photos?.length) {
      logoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      console.log('🖼 Logo URL generated:', logoUrl);
    }

    // 4️⃣ Extract colors safely
    let colors = { 
      primaryColor: theme === 'dark' ? '#3B82F6' : '#1E40AF', 
      backgroundColor: background,
      textColor: theme === 'dark' ? '#F9FAFB' : '#111827',
      accentColor: theme === 'dark' ? '#8B5CF6' : '#7C3AED'
    };
    
    if (logoUrl) {
      try {
        console.log('🎨 Extracting colors from logo...');
        const extractedColors = await extractColorsFromImage(logoUrl);
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
}





};
