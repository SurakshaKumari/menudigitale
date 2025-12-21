'use strict';

module.exports = (sequelize, DataTypes) => {
  const MenuItemAllergen = sequelize.define('MenuItemAllergen', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MenuItems',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    allergenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Allergens',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Additional fields for the junction table if needed
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'menu_item_allergens',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['menuItemId', 'allergenId']
      },
      {
        fields: ['menuItemId']
      },
      {
        fields: ['allergenId']
      }
    ]
  });

  MenuItemAllergen.associate = function(models) {
    // Associations are defined in the main index.js file
    // This model is a junction table, so associations are handled there
  };

  return MenuItemAllergen;
};