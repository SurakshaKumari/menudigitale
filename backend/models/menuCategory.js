const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Menus',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'MenuCategories',
    timestamps: true,
    modelName: 'MenuCategory'
  });

  // Add associations
  MenuCategory.associate = function(models) {
    // Belongs to Menu
    MenuCategory.belongsTo(models.Menu, {
      foreignKey: 'menuId',
      as: 'Menu'
    });
    
    // Has many MenuItems
    MenuCategory.hasMany(models.MenuItem, {
      foreignKey: 'categoryId',
      as: 'MenuItems'
    });
  };

  return MenuCategory;
};