const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db/dbConnection')

const Movie = require('../models/Movie')
const Actor = require('../models/Actor')

class Link extends Model {}
Link.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        required: true,
    },
    actorId: {
        type: DataTypes.INTEGER,
        references: {
          model: Actor,
          key: 'id'
        }
    },
    movieId: {
        type: DataTypes.INTEGER,
        references: {
          model: Movie,
          key: 'id'
        }
    },
    
}, { sequelize, modelName: 'link', timestamps: false })

module.exports = Link