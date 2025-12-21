const db = require('../models');

// Get all allergens
exports.getAllAllergens = async (req, res) => {
  try {
    const allergens = await db.Allergen.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: allergens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch allergens' });
  }
};

// Get allergen by ID
exports.getAllergenById = async (req, res) => {
  try {
    const allergen = await db.Allergen.findByPk(req.params.id);
    if (!allergen) {
      return res.status(404).json({ error: 'Allergen not found' });
    }
    res.json({ success: true, data: allergen });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch allergen' });
  }
};

// Create new allergen
exports.createAllergen = async (req, res) => {
  try {
    const { name, code, description, icon } = req.body;
    
    // Check if allergen with same code or name exists
    const existing = await db.Allergen.findOne({
      where: { 
        [db.Sequelize.Op.or]: [{ name }, { code }]
      }
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Allergen with this name or code already exists' 
      });
    }
    
    const allergen = await db.Allergen.create({
      name,
      code,
      description,
      icon
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Allergen created successfully',
      data: allergen 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create allergen' });
  }
};

// Update allergen
exports.updateAllergen = async (req, res) => {
  try {
    const allergen = await db.Allergen.findByPk(req.params.id);
    if (!allergen) {
      return res.status(404).json({ error: 'Allergen not found' });
    }
    
    const { name, code, description, icon, isActive } = req.body;
    
    // Check for duplicate name/code
    if (name || code) {
      const existing = await db.Allergen.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            name && { name },
            code && { code }
          ].filter(Boolean),
          id: { [db.Sequelize.Op.ne]: req.params.id }
        }
      });
      
      if (existing) {
        return res.status(400).json({ 
          error: 'Another allergen with this name or code already exists' 
        });
      }
    }
    
    await allergen.update({
      name: name || allergen.name,
      code: code || allergen.code,
      description: description !== undefined ? description : allergen.description,
      icon: icon !== undefined ? icon : allergen.icon,
      isActive: isActive !== undefined ? isActive : allergen.isActive
    });
    
    res.json({ 
      success: true, 
      message: 'Allergen updated successfully',
      data: allergen 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update allergen' });
  }
};

// Delete allergen (soft delete)
exports.deleteAllergen = async (req, res) => {
  try {
    const allergen = await db.Allergen.findByPk(req.params.id);
    if (!allergen) {
      return res.status(404).json({ error: 'Allergen not found' });
    }
    
    // Soft delete by marking as inactive
    await allergen.update({ isActive: false });
    
    res.json({ 
      success: true, 
      message: 'Allergen deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete allergen' });
  }
};