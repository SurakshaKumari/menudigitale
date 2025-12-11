// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../models');

const authController = {

  async register(req, res) {
    try {
      const { email, password, name, role, phone } = req.body;
      console.log("Register attempt for:", email);

      // Check if user exists
      const existingUser = await db.User.findOne({ 
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create user
      const user = await db.User.create({
        email,
        password,
        name,
        role: role || 'restaurant_owner',
        phone,
        isActive: true
      });

      // Generate token
      const token = user.generateToken();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toSafeObject(),
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('🔐 Login attempt for:', email);

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user in database - FIXED: use db.User
      const user = await db.User.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'password', 'name', 'role', 'restaurantId', 'lastLogin']
      });
      
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token using the model's method
      const token = user.generateToken();

      console.log('✅ Token generated for user:', user.email);

      // Return user data without password
      const userResponse = user.toSafeObject();
      userResponse.lastLogin = user.lastLogin;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('🔥 Login error:', error);
      
      // Handle specific errors
      if (error.name === 'SequelizeConnectionError') {
        return res.status(503).json({
          success: false,
          error: 'Database connection error. Please try again later.'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await db.User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      
      const user = await db.User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Update user fields
      if (name) user.name = name;
      
      if (email && email !== user.email) {
        // Check if new email is already taken
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({
            success: false,
            error: 'Email already in use'
          });
        }
        user.email = email;
      }

      await user.save();

      // Return updated user without password
      const userResponse = user.toSafeObject();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await db.User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }
};

module.exports = authController;