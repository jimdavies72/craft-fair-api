const { DataTypes } = require("sequelize");
const connection = require("../db/connection");
const Vendor = require("../vendor/vendorModel");

const User = connection.define(
  "User",
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
      allowNull: false,
    }
  },
  { indexes: [{unique: true, fields: ["username"]}, {unique: false, fields: ["userType"]}]}
)

User.hasOne(Vendor)

module.exports = User ;