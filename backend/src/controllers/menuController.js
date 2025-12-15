const { Menu, Category, Dish, Allergen, MenuTranslation, sequelize } = require('../../models');
const { Op } = require('sequelize');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const menuController = {

  async searchRestaurant(req, res) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant name is required'
        });
      }

      const googleResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: name,
            type: 'restaurant',
            key: process.env.GOOGLE_PLACES_API_KEY
          }
        }
      );

      const results = googleResponse.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || null,
        rating: place.rating || null,
        totalRatings: place.user_ratings_total || 0,
        logo: place.photos?.length
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          : null
      }));

      return res.json({
        success: true,
        results
      });

    } catch (error) {
      console.error('Google restaurant search error:', error.message);

      return res.status(500).json({
        success: false,
        message: 'Failed to search restaurant'
      });
    }
  }

};

module.exports = menuController;
