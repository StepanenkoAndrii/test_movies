const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db/dbConnection')

class Actor extends Model {}
Actor.init({
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
}, { sequelize, modelName: 'actor', timestamps: false })

module.exports = Actor