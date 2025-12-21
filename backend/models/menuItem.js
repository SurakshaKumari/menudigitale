const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MenuCategories',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isVegan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSpicy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    calories: {
      type: DataTypes.INTEGER
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      comment: 'Preparation time in minutes'
    }
  }, {
    tableName: 'MenuItems',
    timestamps: true,
    modelName: 'MenuItem'
  });

  // Add associations
  MenuItem.associate = function(models) {
    // Belongs to MenuCategory
    MenuItem.belongsTo(models.MenuCategory, {
      foreignKey: 'categoryId',
      as: 'MenuCategory'
    });
    
    // Many-to-many with Allergens (through MenuItemAllergen junction table)
    MenuItem.belongsToMany(models.Allergen, {
      through: models.MenuItemAllergen,
      foreignKey: 'menuItemId',
      otherKey: 'allergenId',
      as: 'Allergens'
    });
  };

  return MenuItem;
};