const db = require('../models');

// Get item by ID
exports.getMenuItem = async (req, res) => {
  try {
    const item = await db.MenuItem.findByPk(req.params.id, {
      include: [{
        model: db.Allergen,
        through: { attributes: [] }
      }]
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      name,
      description,
      price,
      imageUrl,
      position,
      isAvailable,
      isVegetarian,
      isVegan,
      isSpicy,
      calories,
      preparationTime,
      allergens // Array of allergen IDs
    } = req.body;
    
    // Verify category exists
    const category = await db.MenuCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Create item
    const menuItem = await db.MenuItem.create({
      categoryId,
      name,
      description,
      price,
      imageUrl,
      position: position || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVegetarian: isVegetarian || false,
      isVegan: isVegan || false,
      isSpicy: isSpicy || false,
      calories,
      preparationTime
    });
    
    // Add allergens if provided
    if (allergens && Array.isArray(allergens) && allergens.length > 0) {
      // Verify allergens exist
      const existingAllergens = await db.Allergen.findAll({
        where: {
          id: allergens,
          isActive: true
        }
      });
      
      if (existingAllergens.length > 0) {
        await menuItem.addAllergens(existingAllergens.map(a => a.id));
      }
    }
    
    // Fetch complete item with allergens
    const completeItem = await db.MenuItem.findByPk(menuItem.id, {
      include: [{
        model: db.Allergen,
        through: { attributes: [] }
      }]
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Menu item created successfully',
      data: completeItem 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await db.MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const {
      name,
      description,
      price,
      imageUrl,
      position,
      isAvailable,
      isVegetarian,
      isVegan,
      isSpicy,
      calories,
      preparationTime,
      allergens
    } = req.body;
    
    // Update basic fields
    await item.update({
      name: name || item.name,
      description: description !== undefined ? description : item.description,
      price: price || item.price,
      imageUrl: imageUrl !== undefined ? imageUrl : item.imageUrl,
      position: position !== undefined ? position : item.position,
      isAvailable: isAvailable !== undefined ? isAvailable : item.isAvailable,
      isVegetarian: isVegetarian !== undefined ? isVegetarian : item.isVegetarian,
      isVegan: isVegan !== undefined ? isVegan : item.isVegan,
      isSpicy: isSpicy !== undefined ? isSpicy : item.isSpicy,
      calories: calories !== undefined ? calories : item.calories,
      preparationTime: preparationTime !== undefined ? preparationTime : item.preparationTime
    });
    
    // Update allergens if provided
    if (allergens && Array.isArray(allergens)) {
      await item.setAllergens(allergens);
    }
    
    // Fetch updated item
    const updatedItem = await db.MenuItem.findByPk(item.id, {
      include: [{
        model: db.Allergen,
        through: { attributes: [] }
      }]
    });
    
    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      data: updatedItem 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await db.MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    await item.destroy();
    
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Update item positions within category
exports.updateItemPositions = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { items } = req.body; // Array of {id, position}
    
    const updatePromises = items.map(item => 
      db.MenuItem.update(
        { position: item.position },
        { where: { id: item.id, categoryId } }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.json({ 
      success: true, 
      message: 'Item positions updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item positions' });
  }
};

// Upload item image
exports.uploadItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // Assuming you have multer configured for file uploads
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      data: { imageUrl } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
};