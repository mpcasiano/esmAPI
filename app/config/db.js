const Sequelize = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    freezeTableName: true,
    //operatorsAliases: false,
    timezone: "+08:00",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});