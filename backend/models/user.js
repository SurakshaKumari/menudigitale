'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      User.belongsTo(models.Agency, {
        foreignKey: 'agencyId',
        as: 'agency'
      });
      
      // Add these new associations
      User.hasMany(models.Menu, {
        foreignKey: 'userId',
        as: 'menus'
      });
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

    // Generate refresh token
    generateRefreshToken() {
      return jwt.sign(
        { id: this.id },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
        { expiresIn: '30d' }
      );
    }

    // Get safe user data (without sensitive info)
    toSafeObject() {
      const { password, createdAt, updatedAt, ...safeData } = this.toJSON();
      return safeData;
    }

    // Check if user is admin
    isAdmin() {
      return this.role === 'admin';
    }

    // Check if user is restaurant owner
    isRestaurantOwner() {
      return this.role === 'restaurant_owner';
    }

    // Check if user is editor
    isEditor() {
      return this.role === 'editor';
    }
  }

  User.init({
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
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Profile image must be a valid URL',
          allowEmpty: true
        }
      }
    },
    // Add new fields
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Restaurants',
        key: 'id'
      }
    },
    agencyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Agencies',
        key: 'id'
      }
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
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[0-9\s\-\(\)]{10,}$/,
          msg: 'Please enter a valid phone number'
        }
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
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
      },
      afterCreate: (user) => {
        console.log(`User created: ${user.email} (ID: ${user.id})`);
      }
    },
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      withRestaurant: {
        include: ['restaurant']
      },
      safe: {
        attributes: {
          exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires']
        }
      }
    }
  });

  return User;
};