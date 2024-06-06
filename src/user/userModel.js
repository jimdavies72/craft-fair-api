const { DataTypes } = require('sequelize');
const connection = require('../db/connection');

const User = connection.define(
  'User',
  {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    pw: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  
  {indexes: [{unique: true, fields: ['username']}, {unique: false, fields: ['userType']}]}
)

module.exports = User;
