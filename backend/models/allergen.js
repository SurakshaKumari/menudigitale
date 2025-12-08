'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Allergen extends Model {
    static associate(models) {
      Allergen.belongsToMany(models.Dish, {
        through: 'DishAllergens',
        foreignKey: 'allergenId',
        as: 'dishes'
      });
    }
  }

  Allergen.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Allergen',
    tableName: 'Allergens',
    timestamps: true
  });

  return Allergen;
};