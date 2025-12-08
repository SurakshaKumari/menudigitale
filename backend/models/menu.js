'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      Menu.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      Menu.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Menu.hasMany(models.Category, {
        foreignKey: 'menuId',
        as: 'categories'
      });
      Menu.hasMany(models.MenuView, {
        foreignKey: 'menuId',
        as: 'views'
      });
    }

    // Generate public URL
    getPublicUrl() {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return `${baseUrl}/menu/${this.slug}`;
    }

    // Generate QR code data URL
    getQrCodeData() {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(this.getPublicUrl())}`;
    }

    // Get total dishes count
    async getDishesCount() {
      const categories = await this.getCategories({
        include: [{
          model: sequelize.models.Dish,
          as: 'dishes'
        }]
      });
      
      return categories.reduce((total, category) => {
        return total + (category.dishes ? category.dishes.length : 0);
      }, 0);
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
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Menu title is required'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Slug must be unique'
      },
      validate: {
        is: {
          args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'it',
      validate: {
        isIn: {
          args: [['it', 'en', 'fr', 'de', 'es', 'zh']],
          msg: 'Invalid language code'
        }
      }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'EUR',
      validate: {
        isIn: {
          args: [['EUR', 'USD', 'GBP', 'JPY', 'CAD']],
          msg: 'Invalid currency code'
        }
      }
    },
    styleConfig: {
      type: DataTypes.JSON,
      allowNull: true,
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
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pdfTemplate: {
      type: DataTypes.ENUM('classic', 'modern', 'elegant', 'minimal'),
      defaultValue: 'classic'
    },
    whatsappNumbers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
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
          // Generate slug from title
          menu.slug = menu.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      },
      beforeCreate: (menu) => {
        // Ensure unique slug
        menu.slug = `${menu.slug}-${Date.now()}`;
      }
    }
  });

  return Menu;
};