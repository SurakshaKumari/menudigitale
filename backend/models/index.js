'use strict';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    dialectOptions: config.dialOptions || {},
    // For Heroku/Production
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
);

const db = {};

// Load all models
const modelFiles = [
  'user',
  'restaurant',
  'menu',
  'menuCategory',     // New model for categories
  'menuItem',         // New model for menu items
  'allergen',         // New model for allergens
  'menuItemAllergen'  // New model for junction table
];

modelFiles.forEach(modelFile => {
  const model = require(`./${modelFile}`)(sequelize, DataTypes);
  db[model.name] = model;
  console.log(`✅ Loaded model: ${model.name}`);
});

// Define model names for easy reference
db.User = db.User || db.user;
db.Restaurant = db.Restaurant || db.restaurant;
db.Menu = db.Menu || db.menu;
db.MenuCategory = db.MenuCategory || db.menuCategory;
db.MenuItem = db.MenuItem || db.menuItem;
db.Allergen = db.Allergen || db.allergen;
db.MenuItemAllergen = db.MenuItemAllergen || db.menuItemAllergen;

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`✅ Applied associations for: ${modelName}`);
  }
});

// Ensure all foreign key relationships are defined
const defineAssociations = () => {
  console.log('🔗 Defining model associations...');
  
  try {
    // User - Restaurant relationship
    if (db.User && db.Restaurant) {
      db.User.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
      db.Restaurant.hasMany(db.User, { foreignKey: 'restaurantId', as: 'users' });
      console.log('✅ User-Restaurant association defined');
    }
    
    // Restaurant - Menu relationship
    if (db.Restaurant && db.Menu) {
      db.Restaurant.hasMany(db.Menu, { foreignKey: 'restaurantId', as: 'menus' });
      db.Menu.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
      console.log('✅ Restaurant-Menu association defined');
    }
    
    // Menu - User relationship (who created the menu)
    if (db.Menu && db.User) {
      db.Menu.belongsTo(db.User, { foreignKey: 'userId', as: 'creator' });
      db.User.hasMany(db.Menu, { foreignKey: 'userId', as: 'createdMenus' });
      console.log('✅ Menu-User association defined');
    }
    
    // Menu - MenuCategory relationship
    if (db.Menu && db.MenuCategory) {
      db.Menu.hasMany(db.MenuCategory, { foreignKey: 'menuId', as: 'categories' });
      db.MenuCategory.belongsTo(db.Menu, { foreignKey: 'menuId', as: 'menu' });
      console.log('✅ Menu-MenuCategory association defined');
    }
    
    // MenuCategory - MenuItem relationship
    if (db.MenuCategory && db.MenuItem) {
      db.MenuCategory.hasMany(db.MenuItem, { foreignKey: 'categoryId', as: 'items' });
      db.MenuItem.belongsTo(db.MenuCategory, { foreignKey: 'categoryId', as: 'category' });
      console.log('✅ MenuCategory-MenuItem association defined');
    }
    
    // MenuItem - Allergen many-to-many relationship
    if (db.MenuItem && db.Allergen && db.MenuItemAllergen) {
      db.MenuItem.belongsToMany(db.Allergen, {
        through: db.MenuItemAllergen,
        foreignKey: 'menuItemId',
        otherKey: 'allergenId',
        as: 'allergens'
      });
      
      db.Allergen.belongsToMany(db.MenuItem, {
        through: db.MenuItemAllergen,
        foreignKey: 'allergenId',
        otherKey: 'menuItemId',
        as: 'menuItems'
      });
      
      console.log('✅ MenuItem-Allergen association defined');
    }
    
    console.log('✅ All associations defined successfully');
  } catch (error) {
    console.error('❌ Error defining associations:', error);
  }
};

// Call the association function
defineAssociations();

// Database connection test
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Test each model
    const models = ['User', 'Restaurant', 'Menu', 'MenuCategory', 'MenuItem', 'Allergen'];
    for (const modelName of models) {
      try {
        if (db[modelName]) {
          const count = await db[modelName].count();
          console.log(`📊 ${modelName} table has ${count} records`);
        }
      } catch (err) {
        console.log(`ℹ️  ${modelName} table doesn't exist yet or has no records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Export the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export the test function
db.testConnection = testConnection;

// Sync function for development
db.syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Syncing database...');
    const syncOptions = {
      alter: process.env.NODE_ENV === 'development',
      force: false,
      ...options
    };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');
    
    // Seed default allergens if needed
    await seedDefaultAllergens();
    
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    return false;
  }
};

// Seed default allergens
const seedDefaultAllergens = async () => {
  try {
    const defaultAllergens = [
      { name: 'Gluten', code: 'A', description: 'Contains gluten from wheat, rye, barley, oats', icon: '🌾' },
      { name: 'Crustaceans', code: 'B', description: 'Crustaceans such as prawns, crabs, lobster, crayfish', icon: '🦐' },
      { name: 'Eggs', code: 'C', description: 'Eggs and egg products', icon: '🥚' },
      { name: 'Fish', code: 'D', description: 'Fish and fish products', icon: '🐟' },
      { name: 'Peanuts', code: 'E', description: 'Peanuts and peanut products', icon: '🥜' },
      { name: 'Soybeans', code: 'F', description: 'Soybeans and soy products', icon: '🌱' },
      { name: 'Milk', code: 'G', description: 'Milk and milk products (including lactose)', icon: '🥛' },
      { name: 'Nuts', code: 'H', description: 'Tree nuts (almonds, hazelnuts, walnuts, etc.)', icon: '🌰' },
      { name: 'Celery', code: 'I', description: 'Celery and celery products', icon: '🥬' },
      { name: 'Mustard', code: 'J', description: 'Mustard and mustard products', icon: '🌭' },
      { name: 'Sesame', code: 'K', description: 'Sesame seeds and sesame products', icon: '⚫' },
      { name: 'Sulphur dioxide', code: 'L', description: 'Sulphur dioxide and sulphites', icon: '⚗️' },
      { name: 'Lupin', code: 'M', description: 'Lupin and lupin products', icon: '🌿' },
      { name: 'Molluscs', code: 'N', description: 'Molluscs such as mussels, oysters, squid', icon: '🐚' }
    ];
    
    if (db.Allergen) {
      for (const allergen of defaultAllergens) {
        const [instance, created] = await db.Allergen.findOrCreate({
          where: { code: allergen.code },
          defaults: allergen
        });
        
        if (created) {
          console.log(`✅ Seeded allergen: ${allergen.name} (${allergen.code})`);
        }
      }
      console.log('✅ Default allergens seeded');
    }
  } catch (error) {
    console.warn('⚠️ Could not seed allergens:', error.message);
  }
};

console.log('\n🎯 Available models in db object:', Object.keys(db).filter(key => !['sequelize', 'Sequelize', 'testConnection', 'syncDatabase'].includes(key)));

module.exports = db;