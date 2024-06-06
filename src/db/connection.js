const { Sequelize } = require('sequelize');

const connection = new Sequelize(
  process.env.DB,
  process.env.DB_UN,
  process.env.DB_PW,
  {
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
);
console.log("DB Connected");

module.exports = connection;


