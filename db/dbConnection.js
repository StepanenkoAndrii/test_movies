const { Sequelize }  = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
    process.env.DB,
    process.env.USER,
    process.env.PASS,
    { dialect: 'sqlite', host: process.env.HOST }
)

module.exports = sequelize