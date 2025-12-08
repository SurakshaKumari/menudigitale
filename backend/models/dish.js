'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      Dish.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Dish.belongsToMany(models.Allergen, {
        through: 'DishAllergens',
        foreignKey: 'dishId',
        as: 'allergens'
      });
    }
  }

  Dish.init({
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'preparation_time'
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Dish',
    tableName: 'dishes',
    timestamps: true
  });

  return Dish;
};