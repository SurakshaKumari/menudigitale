const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuItemAllergen = sequelize.define('MenuItemAllergen', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MenuItems',
        key: 'id'
      }
    },
    allergenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Allergens',
        key: 'id'
      }
    }
  }, {
    tableName: 'MenuItemAllergens',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['menuItemId', 'allergenId']
      }
    ]
  });

  return MenuItemAllergen;
};