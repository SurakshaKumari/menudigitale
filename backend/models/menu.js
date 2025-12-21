'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      // Restaurant association
      Menu.belongsTo(models.Restaurant, { 
        foreignKey: 'restaurantId', 
        as: 'Restaurant' // Use 'Restaurant' to match include
      });
      
      // User association  
      Menu.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'User' // Use 'User' to match include
      });
      
      // Menu Categories association (your MenuCategory model)
      Menu.hasMany(models.MenuCategory, { 
        foreignKey: 'menuId', 
        as: 'MenuCategories' // Plural, matches your model name
      });
      
      // Menu Items association (direct, through categories)
      Menu.hasMany(models.MenuItem, { 
        foreignKey: 'categoryId', // This might need adjustment
        as: 'MenuItems' // This depends on your foreign key setup
      });
    }

    getPublicUrl() {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return `${baseUrl}/menu/${this.slug}`;
    }

    getQrCodeData() {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(this.getPublicUrl())}`;
    }
  }

  Menu.init({
    restaurantId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { 
        model: 'Restaurants', 
        key: 'id' 
      } 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { 
        model: 'Users', 
        key: 'id' 
      } 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    slug: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    language: { 
      type: DataTypes.STRING, 
      defaultValue: 'it' 
    },
    styleConfig: { 
      type: DataTypes.JSON, 
      defaultValue: { 
        fontFamily: 'Inter', 
        fontSize: 'medium', 
        alignment: 'center', 
        primaryColor: '#3B82F6', 
        backgroundColor: '#FFFFFF', 
        showImages: true, 
        showPrices: true, 
        showAllergens: true 
      } 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    isPublic: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    metadata: { 
      type: DataTypes.JSON, 
      allowNull: true, 
      defaultValue: {} 
    }
  }, {
    sequelize,
    modelName: 'Menu',
    tableName: 'Menus',
    timestamps: true,
    hooks: {
      beforeValidate: (menu) => {
        if (!menu.slug && menu.title) {
          menu.slug = menu.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      },
      beforeCreate: (menu) => {
        menu.slug = `${menu.slug}-${Date.now()}`;
      }
    }
  });

  return Menu;
};