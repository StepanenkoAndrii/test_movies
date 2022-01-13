const {Op} = require('sequelize')
const fs = require('fs').promises
const Movie = require('../models/Movie')
const Actor = require('../models/Actor')
const Format = require('../models/Format')
const Link = require('../models/Link')

// Getting new movie's id
async function getNewMovieId() {
    // Getting all movies in DESC order by their ids
    const movies = await Movie.findAll({order: [['id', 'DESC']]})

    // Returning new movie's id
    return Number((JSON.parse(JSON.stringify(movies, null, 2)))[0].id)
}

// Adding actors and links to the database
async function addActorsAndLinks(movieData) {
    const actorsArr = []
    let splitActors

    // Checking if data were given in x-www-form-urlencoded or raw format
    // (in first case, actors data were given as a string; in second, as an array)
    if (!Array.isArray(movieData.actors)) splitActors = movieData.actors.split(', ')
    else splitActors = movieData.actors

    // Getting an array of actors (actorsArr)
    splitActors.forEach(actor => {
        actorsArr.push(actor)
    })
    for (let i = 0; i < actorsArr.length; i++) {

        // Getting all actors from db who are also in actorsArr array
        const actor = await Actor.findAll({
            where: {name: actorsArr[i]}
        })

        // Creating new actor (if he/she hasn't already existed) and new link (with new actor and new movie)
        if (actor.length === 0) {
            const newActor = await Actor.create({
                name: actorsArr[i],
            })
            const newLink = await Link.create({
                actorId: newActor.id,
                movieId: await getNewMovieId(),
            })
        }

        // Creating new link (with found actor and new movie)
        else {
            const newLink = await Link.create({
                actorId: (JSON.parse(JSON.stringify(actor, null, 2)))[0].id,
                movieId: await getNewMovieId(),
            })
        }
    }
}

// Deleting actors and links from the database
async function deleteActorsAndLinks(movieId) {
    const actorIds = []
    const removableActorIds = []

    // Getting all links from the database by movie's id
    const movieLinks = await Link.findAll({
        where: {movieId: movieId}
    })

    // Checking if movie with such id doesn't exist
    if (JSON.parse(JSON.stringify(movieLinks, null, 2)).length === 0) return 'movie'

    // Getting an array of actors' ids (actorIds)
    movieLinks.forEach(link => {
        actorIds.push(link.getDataValue('actorId'))
    })
    for (const actorId of actorIds) {

        // Getting all links were actor was involved into another movie (not the one we deleting)
        const actorLinks = await Link.findAll({
            where: {
                actorId: actorId,
                movieId: {[Op.ne]: [movieId]}
            }
        })

        // Pushing actor's id to an array of actors' ids (actors in this array will be deleted)
        if (actorLinks.length === 0) {
            removableActorIds.push(actorId)
        }

        // Deleting all links
        const deletedLinks = await Link.destroy({
            where: {movieId: movieId},
        })

        // Deleting all actors (who are in the removableActorIds array)
        for (const removableActorId of removableActorIds) {
            const deletedActor = await Actor.destroy({
                where: {id: removableActorId},
            })
        }
    }
    return ''
}

// Getting all data from downloaded file
async function getFileData(filePath) {
    try {

        // Asynchronously reading all data from given file
        const data = await fs.readFile(filePath)

        return data.toString()
    } catch (error) {
        console.error(`Unable to read the file: ${error.message}`)
    }
}

module.exports = {

    // Getting all movies (with some filtering)
    async getMovies(params) {
        let movies = []
        let filteredMovies = []
        let movieIds = []
        let sort = 'id'
        let order = 'ASC'
        let limit = 20
        let offset = 0
        let error = ''

        // Checking if sort parameter was given and what value it has
        if (params.sort) {
            (params.sort === 'title') ? (sort = 'title') : (
                (params.sort === 'year') ? (sort = 'year') : (error = 'sort')
            )
        }

        // Returning error if sort parameter was given but with incorrect value
        if (error === 'sort') return 'sort'

        // Checking if order parameter was given and what value it has
        if (params.order) (params.order === 'DESC') ? (order = 'DESC') : (
            (params.order === 'ASC') ? (order = 'ASC') : (error = 'order')
        )

        // Returning error if order parameter was given but with incorrect value
        if (error === 'order') return 'order'

        // Checking if limit parameter was given and what value it has
        if (params.limit) (!isNaN(params.limit)) ? (
            (Number(params.limit) >= 0) ? (limit = params.limit) : (error = 'limit')
        ) : (error = 'limit2')

        // Returning error if limit parameter was given but with incorrect value
        if (error === 'limit') return 'limit'
        else if (error === 'limit2') return 'limit2'

        // Checking if offset parameter was given and what value it has
        if (params.offset) (!isNaN(params.offset)) ? (
            (Number(params.offset) >= 0) ? (offset = params.offset) : (error = 'offset')
        ) : (error = 'offset2')

        // Returning error if offset parameter was given but with incorrect value
        if (error === 'offset') return 'offset'
        else if (error === 'offset2') return 'offset2'

        // Getting all movies from the database but with some filter options
        movies = await Movie.findAll({
            order: [[sort, order]],
            limit: limit,
            offset: offset
        })

        // Returning all found movies if actor's name and movie's title parameters weren't given
        if (!params.actor && !params.title) return JSON.stringify(movies, null, 2)

        movies = JSON.parse(JSON.stringify(movies, null, 2))

        // If actor parameter was given
        if (params.actor) {

            // Returning error if actor's name was given but incorrectly
            if (params.actor.split(' ').length < 2) return 'actor'

            // Getting all actors by actor parameter given
            const actor = await Actor.findAll({
                where: {name: params.actor}
            })

            // Returning error if no actor with given name was found
            if (JSON.parse(JSON.stringify(actor, null, 2)).length === 0) return 'actor2'

            // Getting all links with found actor
            const links = await Link.findAll({
                where: {actorId: JSON.parse(JSON.stringify(actor, null, 2))[0].id}
            })

            // Getting all movies' ids which are in found links
            for (const link of links) movieIds.push(link.getDataValue('movieId'))

            // If title parameter was given
            if (params.title) {

                // Getting an array of movies by actor's name and movie's title given
                for (const movie of movies)
                    if (movieIds.includes(movie.id) && movie.title === params.title) filteredMovies.push(movie)

                // Returning error if no movies with given actor's name and movie's title were found
                if (filteredMovies.length === 0) return 'movie'
            }

            // If actor parameter was given, but title wasn't
            else {

                // Getting an array of movies by actor's name given
                for (const movie of movies)
                    if (movieIds.includes(movie.id)) filteredMovies.push(movie)

                // Returning error if no movies with given actor's name were found
                if (filteredMovies.length === 0) return 'movie2'
            }
        }

        // If title parameter was given, but name wasn't
        else if (params.title) {

            // Getting an array of movies by movie's title given
            for (const movie of movies)
                if (movie.title === params.title) filteredMovies.push(movie)

            // Returning error if no movies with given movie's title were found
            if (filteredMovies.length === 0) return 'movie3'
        }

        return JSON.stringify(filteredMovies, null, 2)
    },

    // Getting all movie actors
    async getMovieActors(id) {
        const actorIds = []

        // Getting all links by movie's id given
        const links = await Link.findAll({
            where: {movieId: id}
        })

        // Getting an array of actors' ids by found links
        links.forEach(link => {
            actorIds.push(link.getDataValue('actorId'))
        })

        // Getting all actors by found actors' ids
        const movieActors = await Actor.findAll({
            where: {id: actorIds}
        })

        return JSON.stringify(movieActors, null, 2)
    },

    // Getting movie format
    async getMovieFormat(id) {

        // Getting all movies by movie's id given
        const movie = await Movie.findAll({
            where: {id: id}
        })

        // Getting format's id by found movie
        const formatId = JSON.parse(JSON.stringify(movie, null, 2))[0].formatId

        // Getting format by found format's id
        const movieFormat = await Format.findAll({
            where: {id: formatId}
        })

        return JSON.stringify(movieFormat, null, 2)
    },

    // Creating new movie
    async addMovie(movieData) {
        let splitActors
        let format

        // Checking if title was given incorrectly
        if (typeof movieData.title === 'string') {
            if (movieData.title.length === 0) return 'title'
        } else return 'title2'

        // Checking if year was given incorrectly
        if (typeof movieData.year === 'number') {
            if (movieData.year <= 0) return 'year'
        } else return 'year2'

        // Checking if format was given incorrectly
        if (typeof movieData.format === 'string') {
            if (movieData.format.length > 0) {
                format = await Format.findAll({
                    where: {name: movieData.format}
                })
                if (JSON.parse(JSON.stringify(format, null, 2)).length === 0) return 'format'
            } else return 'format2'
        } else return 'format3'

        // Checking if actor's name was given incorrectly
        if (movieData.actors.length === 0 && typeof movieData.actors !== 'string' && !Array.isArray(movieData.actors))
            return 'actor'
        if (!Array.isArray(movieData.actors)) splitActors = movieData.actors.split(', ')
        else splitActors = movieData.actors
        for (const splitActor of splitActors) {
            if (typeof splitActor !== 'string') return 'actor2'
            if (splitActor.split(' ').length < 2) return 'actor3'
        }

        // Getting new movie, created by given values
        const newMovie = await Movie.create({
            title: movieData.title,
            year: Number(movieData.year),
            formatId: Number(JSON.parse(JSON.stringify(format, null, 2))[0].id)
        })

        // Adding actors and links
        await addActorsAndLinks(movieData)

        return JSON.stringify(newMovie, null, 2)
    },

    // Deleting movie
    async deleteMovie(id) {

        // Checking if any error occurred while deleting movie
        const error = await deleteActorsAndLinks(id)
        if (error === 'movie') return 0

        // Deleting movie from the database by given movie's id
        return await Movie.destroy({
            where: {id: id},
        })
    },

    // Getting movie by its id
    async getMovieById(id) {

        // Getting all movies from the database by given movie's id
        const movie = await Movie.findAll({
            where: {id: id},
        })

        // Returning error if no such movies were found
        if (JSON.parse(JSON.stringify(movie, null, 2)).length === 0) return 'movie'

        return JSON.stringify(movie, null, 2)
    },

    // Importing movies
    async addImportedMovies() {
        let title = ''
        let year = 0
        let movieFormat = ''
        let actorsArr = []
        let movieId = 0
        let actorIds = []
        let moviesArr = []

        // Getting all data from the downloaded file
        const fileData = await getFileData('../test_task/text/sample_movies.txt')

        // Splitting file into parts (every part - one movie)
        const movieDataArr = fileData.split('\r\n\r\n')
        for (const movieData of movieDataArr) {

            // Splitting every given movie into its fields (title, year, format and actors names)
            title = (movieData.split('\r\n')[0]).split(': ')[1]
            year = (movieData.split('\r\n')[1]).split(': ')[1]
            movieFormat = (movieData.split('\r\n')[2]).split(': ')[1]
            actorsArr = (((movieData.split('\r\n')[3]).split(': ')[1]).split(', '))

            // Getting a format from the database by given format
            const format = await Format.findAll({
                where: {name: movieFormat}
            })

            // Creating new movie with given values
            const newMovie = await Movie.create({
                title: title,
                year: year,
                formatId: (JSON.parse(JSON.stringify(format, null, 2)))[0].id
            })

            // Getting an array of new movies
            moviesArr.push(newMovie)

            // Getting new movie's id
            movieId = (JSON.parse(JSON.stringify(newMovie, null, 2))).id

            for (const actorName of actorsArr) {

                // Getting all actors from the database by given actor's name
                const actor = await Actor.findAll({
                    where: {name: actorName}
                })

                // Creating new actor if it hasn't already existed
                if (actor.length === 0) {
                    const newActor = await Actor.create({
                        name: actorName,
                    })
                    actorIds.push((JSON.parse(JSON.stringify(newActor, null, 2))).id)
                }

                // Getting an array of found actors
                else {
                    actorIds.push((JSON.parse(JSON.stringify(actor, null, 2)))[0].id)
                }
            }

            // Creating a link for every new movie and actors
            for (const actorId of actorIds) {
                const newLink = await Link.create({
                    actorId: actorId,
                    movieId: movieId
                })
            }

            // Clearing actorIds array after every movie creation
            actorIds = []
        }
        return moviesArr
    }
}