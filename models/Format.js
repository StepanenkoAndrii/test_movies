const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db/dbConnection')

class Format extends Model {}
Format.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        required: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
    },
}, { sequelize, modelName: 'format', timestamps: false })

module.exports = Format