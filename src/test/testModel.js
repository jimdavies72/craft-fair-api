const { DataTypes } = require("sequelize");
const connection = require("../db/connection");

const Test = connection.define(
  "Test",
  {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ["message"] }],
  }
);

module.exports = Test;