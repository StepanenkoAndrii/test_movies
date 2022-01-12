const {Op} = require('sequelize')
const fs = require('fs').promises
const Movie = require('../models/Movie')
const Actor = require('../models/Actor')
const Format = require('../models/Format')
const Link = require('../models/Link')

async function getNewMovieId() {
    const movies = await Movie.findAll({order: [['id', 'DESC']]})
    return Number((JSON.parse(JSON.stringify(movies, null, 2)))[0].id)
}

async function addActorsAndLinks(movieData) {
    const actorsArr = []
    let splitActors

    if (!Array.isArray(movieData.actors)) splitActors = movieData.actors.split(', ')
    else splitActors = movieData.actors

    splitActors.forEach(actor => {
        actorsArr.push(actor)
    })
    for (let i = 0; i < actorsArr.length; i++) {
        const actor = await Actor.findAll({
            where: {
                name: actorsArr[i],
            }
        })
        if (actor.length === 0) {
            const newActor = await Actor.create({
                name: actorsArr[i],
            })
            const newLink = await Link.create({
                actorId: newActor.id,
                movieId: await getNewMovieId(),
            })
        } else {
            const newLink = await Link.create({
                actorId: (JSON.parse(JSON.stringify(actor, null, 2)))[0].id,
                movieId: await getNewMovieId(),
            })
        }
    }
}

async function deleteActorsAndLinks(movieId) {
    const actorIds = []
    const removableActorIds = []

    const movieLinks = await Link.findAll({
        where: {movieId: movieId}
    })
    movieLinks.forEach(link => {
        actorIds.push(link.getDataValue('actorId'))
    })
    for (const actorId of actorIds) {
        const actorLinks = await Link.findAll({
            where: {
                actorId: actorId,
                movieId: {[Op.ne]: [movieId]}
            }
        })
        if (actorLinks.length === 0) {
            removableActorIds.push(actorId)
        }
        const deletedLinks = await Link.destroy({
            where: {movieId: movieId},
        })
        for (const removableActorId of removableActorIds) {
            const deletedActor = await Actor.destroy({
                where: {id: removableActorId},
            })
        }
    }
}

async function getFileData(filePath) {
    try {
        const data = await fs.readFile(filePath)
        return data.toString()
    } catch (error) {
        console.error(`Unable to read the file: ${error.message}`)
    }
}

module.exports = {
    async getMovies(params) {
        let movies = []
        let filteredMovies = []
        let movieIds = []
        let sort = 'id'
        let order = 'ASC'
        let limit = 20
        let offset = 0

        if (params.sort) {
            if (params.sort === 'title') sort = 'title'
            else if (params.sort === 'year') sort = 'year'
        }

        if (params.order) if (params.order === 'DESC') order = 'DESC'
        if (params.limit) limit = params.limit
        if (params.offset) offset = params.offset

        movies = await Movie.findAll({
            order: [[sort, order]],
            limit: limit,
            offset: offset
        })

        if (!params.actor && !params.title) return JSON.stringify(movies, null, 2)

        movies = JSON.parse(JSON.stringify(movies, null, 2))

        if (params.actor) {
            const actor = await Actor.findAll({
                where: {name: params.actor}
            })
            if (JSON.parse(JSON.stringify(actor, null, 2)).length === 0) return 'data'
            const links = await Link.findAll({
                where: {actorId: JSON.parse(JSON.stringify(actor, null, 2))[0].id}
            })
            for (const link of links) movieIds.push(link.getDataValue('movieId'))

            if (params.title) {
                for (const movie of movies)
                    if (movieIds.includes(movie.id) && movie.title === params.title) filteredMovies.push(movie)
            } else {
                for (const movie of movies)
                    if (movieIds.includes(movie.id)) filteredMovies.push(movie)
            }
        } else if (params.title) {
            for (const movie of movies)
                if (movie.title === params.title) filteredMovies.push(movie)
        }

        return JSON.stringify(filteredMovies, null, 2)
    },

    async getMovieActors(id) {
        const actorIds = []
        const links = await Link.findAll({
            where: {movieId: id}
        })
        links.forEach(link => {
            actorIds.push(link.getDataValue('actorId'))
        })
        const movieActors = await Actor.findAll({
            where: {id: actorIds}
        })
        return JSON.stringify(movieActors, null, 2)
    },

    async getMovieFormat(id) {
        const movie = await Movie.findAll({
            where: {id: id}
        })
        const formatId = JSON.parse(JSON.stringify(movie, null, 2))[0].formatId
        const movieFormat = await Format.findAll({
            where: {id: formatId}
        })
        return JSON.stringify(movieFormat, null, 2)
    },

    async addMovie(movieData) {
        // console.log(movieData)
        // console.log(Array.isArray(movieData.actors))
        const format = await Format.findAll({
            where: {name: movieData.format}
        })
        if (JSON.parse(JSON.stringify(format, null, 2)).length === 0) return 'format'
        const newMovie = await Movie.create({
            title: movieData.title,
            year: Number(movieData.year),
            formatId: Number(JSON.parse(JSON.stringify(format, null, 2))[0].id)
        })
        await addActorsAndLinks(movieData)
        return JSON.stringify(newMovie, null, 2)
    },

    async deleteMovie(id) {
        await deleteActorsAndLinks(id)
        return await Movie.destroy({
            where: {id: id},
        })
    },

    async getMovieById(id) {
        const movie = await Movie.findAll({
            where: {id: id},
        })
        return JSON.stringify(movie, null, 2)
    },

    async addImportedMovies() {
        let title = ''
        let year = 0
        let movieFormat = ''
        let actorsArr = []
        let movieId = 0
        let actorIds = []
        let moviesArr = []

        const fileData = await getFileData('../test_task/text/sample_movies.txt')
        const movieDataArr = fileData.split('\r\n\r\n')
        for (const movieData of movieDataArr) {
            title = (movieData.split('\r\n')[0]).split(': ')[1]
            year = (movieData.split('\r\n')[1]).split(': ')[1]
            movieFormat = (movieData.split('\r\n')[2]).split(': ')[1]
            actorsArr = (((movieData.split('\r\n')[3]).split(': ')[1]).split(', '))

            const format = await Format.findAll({
                where: {name: movieFormat}
            })
            const newMovie = await Movie.create({
                title: title,
                year: year,
                formatId: (JSON.parse(JSON.stringify(format, null, 2)))[0].id
            })
            moviesArr.push(newMovie)
            movieId = (JSON.parse(JSON.stringify(newMovie, null, 2))).id
            for (const actorName of actorsArr) {
                const actor = await Actor.findAll({
                    where: {name: actorName}
                })
                if (actor.length === 0) {
                    const newActor = await Actor.create({
                        name: actorName,
                    })
                    actorIds.push((JSON.parse(JSON.stringify(newActor, null, 2))).id)
                } else {
                    actorIds.push((JSON.parse(JSON.stringify(actor, null, 2)))[0].id)
                }
            }
            for (const actorId of actorIds) {
                const newLink = await Link.create({
                    actorId: actorId,
                    movieId: movieId
                })
            }
            actorIds = []
        }
        return moviesArr
    }
}