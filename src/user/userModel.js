const { Sequelize, DataTypes} = require("sequelize");
const connection = require("../db/connection")

const User = connection.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pw: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  { indexes: [{unique: true, fields: ["username"]}, {unique: false, fields: ["userType"]}]}
)

module.exports = User ;