const db = require('../models');

// Get all categories for a menu
exports.getMenuCategories = async (req, res) => {
  try {
    const { menuId } = req.params;
    
    const categories = await db.MenuCategory.findAll({
      where: { 
        menuId,
        isActive: true 
      },
      order: [['position', 'ASC']],
      include: [{
        model: db.MenuItem,
        as: 'MenuItems',
        where: { isAvailable: true },
        required: false,
        order: [['position', 'ASC']]
      }]
    });
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { name, description, position } = req.body;
    
    // Verify menu exists
    const menu = await db.Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    const category = await db.MenuCategory.create({
      menuId,
      name,
      description,
      position: position || 0
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully',
      data: category 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await db.MenuCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { name, description, position, isActive } = req.body;
    
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      position: position !== undefined ? position : category.position,
      isActive: isActive !== undefined ? isActive : category.isActive
    });
    
    res.json({ 
      success: true, 
      message: 'Category updated successfully',
      data: category 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await db.MenuCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category has items
    const itemCount = await db.MenuItem.count({
      where: { categoryId: category.id }
    });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with items. Remove items first or use soft delete.' 
      });
    }
    
    await category.destroy();
    
    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Update category positions (reorder)
exports.updateCategoryPositions = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { categories } = req.body; // Array of {id, position}
    
    const updatePromises = categories.map(cat => 
      db.MenuCategory.update(
        { position: cat.position },
        { where: { id: cat.id, menuId } }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.json({ 
      success: true, 
      message: 'Category positions updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update positions' });
  }
};