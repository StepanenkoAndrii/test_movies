const movieRepository = require('../repositories/MovieRepository')
const inputErrors = require('../errors/InputErrors')

// Getting all movies' actors
async function getMovieActors(id) {
    try {
        return await movieRepository.getMovieActors(id);
    } catch (error) {
        console.error(`Unable to get movie actors (controller): ${error}`)
    }
}

// Getting movie's format
async function getMovieFormat(id) {
    try {
        return await movieRepository.getMovieFormat(id);
    } catch (error) {
        console.error(`Unable to get movie format (controller): ${error}`)
    }
}

// Refactoring given movie for better visual representation
async function getRefactoredMovie(movie) {
    try {
        const movieActors = await getMovieActors(movie.id)
        const movieFormat = await getMovieFormat(movie.id)

        // Adding found format to the movie
        movie.format = JSON.parse(movieFormat)[0].name
        movie.actors = []
        JSON.parse(movieActors).forEach(movieActor => {

            // Adding found actors to the movie
            movie.actors.push(movieActor)
        })
        delete movie.formatId

        return movie
    } catch (error) {
        console.error(`Error in refactoring movie (controller): ${error}`)
    }
}

// Refactoring given movies for better visual representation
async function getAllRefactoredMovies(repoMovies) {
    try {
        const movies = []

        // Getting all movies and refactoring them
        JSON.parse(repoMovies).forEach(movie => movies.push(movie))
        for (let movie of movies) movie = await getRefactoredMovie(movie)

        return movies
    } catch (error) {
        console.error(`Error in refactoring movies (controller): ${error}`)
    }
}

module.exports = {

    // Getting movies
    async getMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting found movies
            const repoMovies = await movieRepository.getMovies(req.query)

            // Checking if any error were returned while getting movies
            if (repoMovies.length < 10) {
                const error = await inputErrors.checkAllMovies(repoMovies)
                res.status(400).send(error)
                return
            }

            // Getting all movies refactored
            const movies = await getAllRefactoredMovies(repoMovies)

            res.status(200).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            res.status(404).send(`Unable to get all movies: ${error}`)
        }
    },

    // Creating movie
    async addMovie(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting new movie
            const repoMovie = await movieRepository.addMovie(req.body)

            // Checking if any error were returned while creating new movie
            if (repoMovie.length < 10) {
                const error = await inputErrors.checkNewMovie(repoMovie)
                res.status(400).send(error)
                return
            }

            // Getting movie refactored
            const refactoredMovie = await getRefactoredMovie(JSON.parse(repoMovie))

            res.status(201).send(refactoredMovie)
        } catch (error) {
            res.status(404).send(`Unable to add a new movie: ${error}`)
        }
    },

    // Deleting movie
    async deleteMovie(req, res) {
        try {
            // Getting a response after deleting movie
            const movie = await movieRepository.deleteMovie(req.params.id)

            // Checking if any error were returned while deleting movie
            if (movie === 0) {
                res.status(400).send('Unable to find movie with such id')
                return
            }

            res.status(201).send('Movie has been successfully deleted')
        } catch (error) {
            res.status(404).send(`Unable to delete a movie: ${error}`)
        }
    },

    // Getting movie by its id
    async getMovieById(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting movie by its id
            const movie = await movieRepository.getMovieById(req.params.id)

            // Checking if any error were returned while getting movie by its id
            if (movie === 'movie') {
                res.status(400).send('Unable to find movie with such id')
                return
            }

            const refactoredMovie = await getRefactoredMovie(JSON.parse(movie)[0])

            res.status(200).send(refactoredMovie)
        } catch (error) {
            res.status(404).send(`Unable to get a movie by its id: ${error}`)
        }
    },

    // Adding imported movies
    async addImportedMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting all new imported movies
            const repoMovies = await movieRepository.addImportedMovies()

            // Getting all new imported movies refactored
            const movies = await getAllRefactoredMovies(JSON.stringify(repoMovies, null, 2))

            res.status(201).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            res.status(404).send(`Unable to import movies: ${error}`)
        }
    }
}