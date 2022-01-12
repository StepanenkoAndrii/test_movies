const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db/dbConnection')

class Movie extends Model {}
Movie.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        required: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true,
    },
}, { sequelize, modelName: 'movie', timestamps: false })

module.exports = Movie