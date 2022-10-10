const { DataTypes } = require("sequelize");
const connection = require("../db/connection");
const User = require("../user/userModel");

const Vendor = connection.define(
  "Vendor",
  {
    vendorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      len: [5, 50],
    },
  },
  {
    indexes: [{ unique: true, fields: ["vendorName"] }],
  }
);

Vendor.belongsTo(User);

module.exports = Vendor;
