// models/user.js - TEMPORARY VERSION (no foreign key constraints)
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // TEMPORARILY COMMENT OUT ALL ASSOCIATIONS
      /*
      User.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      User.belongsTo(models.Agency, {
        foreignKey: 'agencyId',
        as: 'agency'
      });
      
      User.hasMany(models.Menu, {
        foreignKey: 'userId',
        as: 'menus'
      });
      */
    }

    // Instance method to check password
    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Generate JWT token
    generateToken() {
      return jwt.sign(
        { 
          id: this.id, 
          email: this.email, 
          role: this.role,
          restaurantId: this.restaurantId 
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
    }

    // Get safe user data (without sensitive info)
    toSafeObject() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is required'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'editor', 'restaurant_owner'),
      defaultValue: 'restaurant_owner',
      validate: {
        isIn: {
          args: [['admin', 'editor', 'restaurant_owner']],
          msg: 'Invalid role specified'
        }
      }
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // CHANGE THESE TO STRING TEMPORARILY (remove foreign key constraints)
    restaurantId: {
      type: DataTypes.STRING, // Changed from INTEGER to STRING
      allowNull: true
      // REMOVED: references: { model: 'Restaurants', key: 'id' }
    },
    agencyId: {
      type: DataTypes.STRING, // Changed from INTEGER to STRING
      allowNull: true
      // REMOVED: references: { model: 'Agencies', key: 'id' }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};