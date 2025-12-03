'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Restaurant.init({
    name: DataTypes.STRING,
    googlePlaceId: DataTypes.STRING,
    address: DataTypes.TEXT,
    phone: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    theme: DataTypes.STRING,
    colors: DataTypes.JSON,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};