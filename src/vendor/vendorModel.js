const { DataTypes } = require("sequelize");
const connection = require("../db/connection");

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

module.exports = Vendor;
