const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const apiRouter = require('./routes/ApiRouter')
const db = require('./db/dbConnection')
const Movie = require('./models/Movie')
const Actor = require('./models/Actor')
const Format = require('./models/Format')
const Link = require('./models/Link')

// Trying to connect to the database
try {
    db.sync().then(() => console.log('Database is working'))
} catch (error) {
    console.error(`Unable to connect to the database: ${error}`)
}

// Using Foreign Keys linking db tables
Format.hasOne(Movie)
Movie.belongsTo(Format)
Movie.belongsToMany(Actor, { through: Link });
Actor.belongsToMany(Movie, { through: Link });

const PORT = process.env.APP_PORT || 8080
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use('/api/v1', apiRouter)
app.use((req, res) => {
    res.status(400).send({ message: "Error in route."});
})

// Trying to connect to the server
try {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
} catch (error) {
    console.error(`Unable to connect to the server: ${error}`)
}

