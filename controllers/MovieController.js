const movieRepository = require('../repositories/MovieRepository')
const inputErrors = require('../errors/InputErrors')

async function getMovieActors(id) {
    try {
        return await movieRepository.getMovieActors(id);
    } catch (error) {
        console.error(`Unable to get movie actors (controller): ${error}`)
    }
}

async function getMovieFormat(id) {
    try {
        return await movieRepository.getMovieFormat(id);
    } catch (error) {
        console.error(`Unable to get movie format (controller): ${error}`)
    }
}

async function getRefactoredMovie(movie) {
    try {
        const movieActors = await getMovieActors(movie.id)
        const movieFormat = await getMovieFormat(movie.id)

        movie.format = JSON.parse(movieFormat)[0].name
        movie.actors = []
        JSON.parse(movieActors).forEach(movieActor => {
            movie.actors.push(movieActor)
        })
        delete movie.formatId

        return movie
    } catch (error) {
        console.error(`Error in refactoring movie (controller): ${error}`)
    }
}

async function getAllRefactoredMovies(repoMovies) {
    try {
        const movies = []

        JSON.parse(repoMovies).forEach(movie => movies.push(movie))
        for (let movie of movies) movie = await getRefactoredMovie(movie)

        return movies
    } catch (error) {
        console.error(`Error in refactoring movies (controller): ${error}`)
    }
}

module.exports = {
    async getMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovies = await movieRepository.getMovies(req.query)

            if (repoMovies.length < 10) {
                const error = await inputErrors.checkAllMovies(repoMovies)
                res.status(400).send(error)
                return
            }

            const movies = await getAllRefactoredMovies(repoMovies)

            res.status(200).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            res.status(404).send(`Unable to get all movies: ${error}`)
        }
    },

    async addMovie(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovie = await movieRepository.addMovie(req.body)

            if (repoMovie.length < 10) {
                const error = await inputErrors.checkNewMovie(repoMovie)
                res.status(400).send(error)
                return
            }

            const refactoredMovie = await getRefactoredMovie(JSON.parse(repoMovie))

            res.status(201).send(refactoredMovie)
        } catch (error) {
            res.status(404).send(`Unable to add a new movie: ${error}`)
        }
    },

    async deleteMovie(req, res) {
        try {
            const movie = await movieRepository.deleteMovie(req.params.id)

            if (movie === 0) {
                res.status(400).send('Unable to find movie with such id')
                return
            }

            res.status(201).send('Movie has been successfully deleted')
        } catch (error) {
            res.status(404).send(`Unable to delete a movie: ${error}`)
        }
    },

    async getMovieById(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const movie = await movieRepository.getMovieById(req.params.id)

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

    async addImportedMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovies = await movieRepository.addImportedMovies()
            const movies = await getAllRefactoredMovies(JSON.stringify(repoMovies, null, 2))

            res.status(201).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            res.status(404).send(`Unable to import movies: ${error}`)
        }
    }
}