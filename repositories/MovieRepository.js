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

    if (JSON.parse(JSON.stringify(movieLinks, null, 2)).length === 0) return 'movie'

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
    return ''
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
        let error = ''

        if (params.sort) {
            (params.sort === 'title') ? (sort = 'title') : (
                (params.sort === 'year') ? (sort = 'year') : (error = 'sort')
            )
        }
        if (error === 'sort') return 'sort'

        if (params.order) (params.order === 'DESC') ? (order = 'DESC') : (
            (params.order === 'ASC') ? (order = 'ASC') : (error = 'order')
        )
        if (error === 'order') return 'order'

        if (params.limit) (!isNaN(params.limit)) ? (
            (Number(params.limit) >= 0) ? (limit = params.limit) : (error = 'limit')
        ) : (error = 'limit2')
        if (error === 'limit') return 'limit'
        else if (error === 'limit2') return 'limit2'

        if (params.offset) (!isNaN(params.offset)) ? (
            (Number(params.offset) >= 0) ? (offset = params.offset) : (error = 'offset')
        ) : (error = 'offset2')
        if (error === 'offset') return 'offset'
        else if (error === 'offset2') return 'offset2'

        movies = await Movie.findAll({
            order: [[sort, order]],
            limit: limit,
            offset: offset
        })

        if (!params.actor && !params.title) return JSON.stringify(movies, null, 2)

        movies = JSON.parse(JSON.stringify(movies, null, 2))

        if (params.actor) {

            if (params.actor.split(' ').length < 2) return 'actor'

            const actor = await Actor.findAll({
                where: {name: params.actor}
            })
            if (JSON.parse(JSON.stringify(actor, null, 2)).length === 0) return 'actor2'
            const links = await Link.findAll({
                where: {actorId: JSON.parse(JSON.stringify(actor, null, 2))[0].id}
            })
            for (const link of links) movieIds.push(link.getDataValue('movieId'))

            if (params.title) {
                for (const movie of movies)
                    if (movieIds.includes(movie.id) && movie.title === params.title) filteredMovies.push(movie)
                if (filteredMovies.length === 0) return 'movie'
            } else {
                for (const movie of movies)
                    if (movieIds.includes(movie.id)) filteredMovies.push(movie)
                if (filteredMovies.length === 0) return 'movie2'
            }
        } else if (params.title) {
            for (const movie of movies)
                if (movie.title === params.title) filteredMovies.push(movie)
            if (filteredMovies.length === 0) return 'movie3'
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
        let splitActors
        let format

        if (typeof movieData.title === 'string') {
            if (movieData.title.length === 0) return 'title'
        } else return 'title2'

        if (typeof movieData.year === 'number') {
            if (movieData.year <= 0) return 'year'
        } else return 'year2'

        if (typeof movieData.format === 'string') {
            if (movieData.format.length > 0) {
                format = await Format.findAll({
                    where: {name: movieData.format}
                })
                if (JSON.parse(JSON.stringify(format, null, 2)).length === 0) return 'format'
            } else return 'format2'
        } else return 'format3'

        if (movieData.actors.length === 0 && typeof movieData.actors !== 'string' && !Array.isArray(movieData.actors))
            return 'actor'
        if (!Array.isArray(movieData.actors)) splitActors = movieData.actors.split(', ')
        else splitActors = movieData.actors
        for (const splitActor of splitActors) {
            if (typeof splitActor !== 'string') return 'actor2'
            if (splitActor.split(' ').length < 2) return 'actor3'
        }

        const newMovie = await Movie.create({
            title: movieData.title,
            year: Number(movieData.year),
            formatId: Number(JSON.parse(JSON.stringify(format, null, 2))[0].id)
        })
        await addActorsAndLinks(movieData)
        return JSON.stringify(newMovie, null, 2)
    },

    async deleteMovie(id) {
        const error = await deleteActorsAndLinks(id)
        if (error === 'movie') return 0
        return await Movie.destroy({
            where: {id: id},
        })
    },

    async getMovieById(id) {
        const movie = await Movie.findAll({
            where: {id: id},
        })

        if (JSON.parse(JSON.stringify(movie, null, 2)).length === 0) return 'movie'

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