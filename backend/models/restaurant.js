'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.hasMany(models.User, {
        foreignKey: 'restaurantId',
        as: 'users'
      });
      Restaurant.hasMany(models.Menu, {
        foreignKey: 'restaurantId',
        as: 'menus'
      });
      // Optional if you have OpeningHours model
      // Restaurant.hasMany(models.OpeningHours, { foreignKey: 'restaurantId', as: 'openingHours' });
    }

    getGoogleMapsUrl() {
      if (this.address && this.googlePlaceId) {
        return `https://www.google.com/maps/place/?q=place_id:${this.googlePlaceId}`;
      }
      return null;
    }

    isOpenNow() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      return true; // Placeholder logic
    }
  }

  Restaurant.init({
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'Restaurant name is required' } } },
    address: { type: DataTypes.TEXT, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    postalCode: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true, validate: { is: { args: /^[\+]?[0-9\s\-\(\)]{10,}$/, msg: 'Please enter a valid phone number' } } },
    email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: { msg: 'Please enter a valid email address' } } },
    website: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: { msg: 'Please enter a valid website URL' } } },
    logoUrl: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: { msg: 'Please enter a valid logo URL' } } },
    coverImageUrl: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: { msg: 'Please enter a valid cover image URL' } } },
    googlePlaceId: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    colors: { type: DataTypes.JSON, allowNull: true, defaultValue: { primary: '#3B82F6', secondary: '#10B981', accent: '#8B5CF6' } },
    theme: { type: DataTypes.ENUM('light','dark','auto'), defaultValue: 'light' },
    socialMedia: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    description: { type: DataTypes.TEXT, allowNull: true },
    cuisines: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'Restaurants',
    timestamps: true
  });

  return Restaurant;
};
