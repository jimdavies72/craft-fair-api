const { Sequelize } = require("sequelize");
const connection = new Sequelize(process.env.DB_URI);

console.log("DB Connected")

module.exports = connection;