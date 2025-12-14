const { Menu, Category, Dish, Allergen, MenuTranslation, sequelize } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const menuController = {
  // Get menu with all categories and dishes
  getMenuById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const menu = await Menu.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'categories',
            separate: true,
            order: [['displayOrder', 'ASC']],
            include: [
              {
                model: Dish,
                as: 'dishes',
                separate: true,
                order: [['displayOrder', 'ASC']],
                include: [
                  {
                    model: Allergen,
                    as: 'allergens',
                    through: { attributes: [] }
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      // Check authorization
      if (userRole !== 'admin' && menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new category
  createCategory: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { menuId } = req.params;
      const { name, description, parentId } = req.body;
      const userId = req.user.id;

      // Verify menu exists and user has access
      const menu = await Menu.findByPk(menuId, { transaction });
      if (!menu) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Menu not found' });
      }

      if (req.user.role !== 'admin' && menu.userId !== userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Get max display order
      const maxOrder = await Category.max('displayOrder', {
        where: { menuId },
        transaction
      }) || 0;

      const category = await Category.create({
        menuId,
        name,
        description,
        parentId,
        displayOrder: maxOrder + 1
      }, { transaction });

      await transaction.commit();
      res.status(201).json(category);
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userId = req.user.id;

      const category = await Category.findByPk(id, {
        include: [{ model: Menu, as: 'menu' }]
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && category.menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      await category.update({ name, description });
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findByPk(id, {
        include: [{ model: Menu, as: 'menu' }],
        transaction
      });

      if (!category) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && category.menu.userId !== userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Delete all dishes in this category first
      await Dish.destroy({
        where: { categoryId: id },
        transaction
      });

      // Delete the category
      await category.destroy({ transaction });
      await transaction.commit();

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add dish to category
  createDish: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { categoryId } = req.params;
      const { title, description, price, allergens = [] } = req.body;

      // Get category with menu for authorization check
      const category = await Category.findByPk(categoryId, {
        include: [{ model: Menu, as: 'menu' }],
        transaction
      });

      if (!category) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check authorization
      const userId = req.user.id;
      if (req.user.role !== 'admin' && category.menu.userId !== userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Get max display order
      const maxOrder = await Dish.max('displayOrder', {
        where: { categoryId },
        transaction
      }) || 0;

      // Create dish
      const dish = await Dish.create({
        categoryId,
        title,
        description,
        price: parseFloat(price),
        displayOrder: maxOrder + 1
      }, { transaction });

      // Attach allergens if provided
      if (allergens.length > 0) {
        await dish.addAllergens(allergens, { transaction });
      }

      // Load with allergens for response
      await dish.reload({
        include: [{ model: Allergen, as: 'allergens' }],
        transaction
      });

      await transaction.commit();
      res.status(201).json(dish);
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating dish:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update dish
  updateDish: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { title, description, price, allergens } = req.body;

      const dish = await Dish.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            include: [{ model: Menu, as: 'menu' }]
          }
        ],
        transaction
      });

      if (!dish) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Dish not found' });
      }

      // Check authorization
      const userId = req.user.id;
      if (req.user.role !== 'admin' && dish.category.menu.userId !== userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Update dish
      await dish.update({
        title,
        description,
        price: price ? parseFloat(price) : dish.price
      }, { transaction });

      // Update allergens if provided
      if (allergens) {
        await dish.setAllergens(allergens, { transaction });
      }

      // Reload with allergens
      await dish.reload({
        include: [{ model: Allergen, as: 'allergens' }],
        transaction
      });

      await transaction.commit();
      res.json(dish);
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating dish:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete dish
  deleteDish: async (req, res) => {
    try {
      const { id } = req.params;

      const dish = await Dish.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            include: [{ model: Menu, as: 'menu' }]
          }
        ]
      });

      if (!dish) {
        return res.status(404).json({ error: 'Dish not found' });
      }

      // Check authorization
      const userId = req.user.id;
      if (req.user.role !== 'admin' && dish.category.menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      await dish.destroy();
      res.json({ message: 'Dish deleted successfully' });
    } catch (error) {
      console.error('Error deleting dish:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Translate menu content
  translateMenu: async (req, res) => {
    try {
      const { id } = req.params;
      const { language, content } = req.body;
      const userId = req.user.id;

      const menu = await Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Check if translation already exists
      const existingTranslation = await MenuTranslation.findOne({
        where: { menuId: id, language }
      });

      if (existingTranslation) {
        return res.json(existingTranslation);
      }

      // Prepare content for OpenAI
      const promptContent = prepareContentForTranslation(content);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate ONLY the text values. Keep all JSON structure identical. Return only valid JSON.'
          },
          {
            role: 'user',
            content: `Translate the following menu content to ${language}:\n${JSON.stringify(promptContent, null, 2)}`
          }
        ],
        temperature: 0.3
      });

      let translatedContent;
      try {
        translatedContent = JSON.parse(response.choices[0].message.content);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        return res.status(500).json({ error: 'Translation failed' });
      }

      // Store translation
      const translation = await MenuTranslation.create({
        menuId: id,
        language,
        translations: translatedContent
      });

      // Update statistics
      await sequelize.query(
        `INSERT INTO MenuStatistics (menuId, translationsCount, updatedAt) 
         VALUES (:menuId, 1, NOW())
         ON DUPLICATE KEY UPDATE 
         translationsCount = translationsCount + 1, updatedAt = NOW()`,
        {
          replacements: { menuId: id }
        }
      );

      res.json(translation);
    } catch (error) {
      console.error('Error translating menu:', error);
      res.status(500).json({ error: 'Translation failed' });
    }
  },

  // Get public menu with translation
  getPublicMenu: async (req, res) => {
    try {
      const { slug, language } = req.params;

      const menu = await Menu.findOne({
        where: { slug, isActive: true, isPublic: true },
        include: [
          {
            model: Category,
            as: 'categories',
            where: { parentId: null },
            required: false,
            order: [['displayOrder', 'ASC']],
            include: [
              {
                model: Category,
                as: 'children',
                order: [['displayOrder', 'ASC']],
                include: [
                  {
                    model: Dish,
                    as: 'dishes',
                    order: [['displayOrder', 'ASC']],
                    include: [
                      {
                        model: Allergen,
                        as: 'allergens',
                        through: { attributes: [] }
                      }
                    ]
                  }
                ]
              },
              {
                model: Dish,
                as: 'dishes',
                order: [['displayOrder', 'ASC']],
                include: [
                  {
                    model: Allergen,
                    as: 'allergens',
                    through: { attributes: [] }
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      // Increment view count
      await menu.increment('viewsCount');
      await menu.update({ lastViewedAt: new Date() });

      // Apply translation if requested
      if (language && language !== 'en') {
        const translation = await MenuTranslation.findOne({
          where: { menuId: menu.id, language }
        });

        if (translation) {
          const menuData = menu.toJSON();
          const translatedMenu = applyTranslations(menuData, translation.translations);
          return res.json(translatedMenu);
        }
      }

      res.json(menu);
    } catch (error) {
      console.error('Error fetching public menu:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update menu style
  updateMenuStyle: async (req, res) => {
    try {
      const { id } = req.params;
      const { styleConfig } = req.body;
      const userId = req.user.id;

      const menu = await Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      await menu.update({ styleConfig });
      res.json(menu);
    } catch (error) {
      console.error('Error updating menu style:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get menu statistics
  getMenuStatistics: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const menu = await Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && menu.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Get statistics
      const [statistics] = await sequelize.query(
        `SELECT 
          viewsCount,
          (SELECT translationsCount FROM MenuStatistics WHERE menuId = :menuId) as translationsCount,
          (SELECT JSON_OBJECTAGG(language, count) 
           FROM (
             SELECT language, COUNT(*) as count 
             FROM MenuTranslations 
             WHERE menuId = :menuId 
             GROUP BY language
           ) as langStats) as translationsByLanguage
         FROM Menus 
         WHERE id = :menuId`,
        {
          replacements: { menuId: id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json(statistics);
    } catch (error) {
      console.error('Error fetching menu statistics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Helper functions
function prepareContentForTranslation(content) {
  return {
    title: content.title,
    description: content.description,
    categories: (content.categories || []).map(category => ({
      name: category.name,
      description: category.description,
      children: (category.children || []).map(child => ({
        name: child.name,
        description: child.description,
        dishes: (child.dishes || []).map(dish => ({
          title: dish.title,
          description: dish.description
        }))
      })),
      dishes: (category.dishes || []).map(dish => ({
        title: dish.title,
        description: dish.description
      }))
    }))
  };
}

function applyTranslations(menuData, translations) {
  const translated = { ...menuData };

  // Apply top-level translations
  if (translations.title) translated.title = translations.title;
  if (translations.description) translated.description = translations.description;

  // Apply category translations
  if (translations.categories && menuData.categories) {
    translated.categories = menuData.categories.map((category, catIndex) => {
      const translatedCategory = { ...category };
      const catTrans = translations.categories[catIndex];

      if (catTrans) {
        if (catTrans.name) translatedCategory.name = catTrans.name;
        if (catTrans.description) translatedCategory.description = catTrans.description;

        // Apply child category translations
        if (catTrans.children && category.children) {
          translatedCategory.children = category.children.map((child, childIndex) => {
            const translatedChild = { ...child };
            const childTrans = catTrans.children[childIndex];

            if (childTrans) {
              if (childTrans.name) translatedChild.name = childTrans.name;
              if (childTrans.description) translatedChild.description = childTrans.description;

              // Apply dish translations in child categories
              if (childTrans.dishes && child.dishes) {
                translatedChild.dishes = child.dishes.map((dish, dishIndex) => {
                  const translatedDish = { ...dish };
                  const dishTrans = childTrans.dishes[dishIndex];

                  if (dishTrans) {
                    if (dishTrans.title) translatedDish.title = dishTrans.title;
                    if (dishTrans.description) translatedDish.description = dishTrans.description;
                  }

                  return translatedDish;
                });
              }
            }

            return translatedChild;
          });
        }

        // Apply dish translations in parent categories
        if (catTrans.dishes && category.dishes) {
          translatedCategory.dishes = category.dishes.map((dish, dishIndex) => {
            const translatedDish = { ...dish };
            const dishTrans = catTrans.dishes[dishIndex];

            if (dishTrans) {
              if (dishTrans.title) translatedDish.title = dishTrans.title;
              if (dishTrans.description) translatedDish.description = dishTrans.description;
            }

            return translatedDish;
          });
        }
      }

      return translatedCategory;
    });
  }

  return translated;
}

module.exports = menuController;