const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db/dbConnection')

class User extends Model {}
User.init({
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
        // isEmail: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
    },
}, { sequelize, modelName: 'user', timestamps: false })

module.exports = User