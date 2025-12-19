'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      User.hasMany(models.Menu, {
        foreignKey: 'userId',
        as: 'menus'
      });
    }

    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    generateToken() {
      return jwt.sign(
        { id: this.id, email: this.email, role: this.role, restaurantId: this.restaurantId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
    }

    toSafeObject() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
  }

  User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: { msg: 'Email already exists' }, validate: { isEmail: { msg: 'Please enter a valid email' }, notEmpty: { msg: 'Email required' } } },
    password: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'Password required' }, len: { args: [6,100], msg: 'Password must be at least 6 chars' } } },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'Name required' }, len: { args:[2,100], msg:'Name must be 2-100 chars' } } },
    role: { type: DataTypes.ENUM('admin','editor','restaurant_owner'), defaultValue: 'restaurant_owner' },
    profileImage: { type: DataTypes.STRING, allowNull: true },
    restaurantId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Restaurants', key: 'id' } },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: { type: DataTypes.DATE, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
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
