'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Menu, {
        foreignKey: 'menuId',
        as: 'menu'
      });
      Category.hasMany(models.Dish, {
        foreignKey: 'categoryId',
        as: 'dishes'
      });
      Category.belongsTo(models.Category, {
        foreignKey: 'parentId',
        as: 'parent'
      });
      Category.hasMany(models.Category, {
        foreignKey: 'parentId',
        as: 'subcategories'
      });
    }
  }

  Category.init({
    menuId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'menu_id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true
  });

  return Category;
};