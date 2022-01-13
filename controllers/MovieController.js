const movieRepository = require('../repositories/MovieRepository')

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

async function checkAllMovies(repoMovies) {
    switch (repoMovies) {
        case 'sort':
            return 'Incorrect sort parameter'
        case "order":
            return 'Incorrect order parameter'
        case "limit":
            return 'Incorrect limit parameter (must be >= 0)'
        case "limit2":
            return 'Incorrect limit parameter (must be a number)'
        case "offset":
            return 'Incorrect offset parameter (must be >= 0)'
        case "offset2":
            return 'Incorrect offset parameter (must be a number)'
        case "actor":
            return 'Incorrect actor input (must be a name and a surname given separately (f.e. Mel Brooks))'
        case "actor2":
            return 'Actor with such credentials doesn\'t exist'
        case "movie":
            return 'Movie with such title and actor credentials in given selection doesn\'t exist'
        case "movie2":
            return 'Movie with such actor credentials in given selection doesn\'t exist'
        case "movie3":
            return 'Movie with such title in given selection doesn\'t exist'
        default:
            return 'Some incorrect input'
    }
}

async function checkNewMovie(repoMovie) {
    switch (repoMovie) {
        case "title":
            return 'Incorrect title input (must be some title, not an empty string (f.e. Casablanca))'
        case "title2":
            return 'Incorrect title input (must be a string)'
        case "year":
            return 'Incorrect year input (must be > 0)'
        case "year2":
            return 'Incorrect year input (must be a number)'
        case "format":
            return 'Incorrect format input (must be an existing movie format (DVD, VHS or Blu-Ray), not an null value (f.e. DVD))'
        case "format2":
            return 'Incorrect format input (must be some format, not an empty string (f.e. DVD))'
        case "format3":
            return 'Incorrect format input (must be a string)'
        case "actor":
            return 'Incorrect actor input (must be an array of names and surnames given separately (f.e. ["Mel Brooks", "Joaquin Phoenix"]))'
        case "actor2":
            return 'Incorrect actor input (every actor given must be a string)'
        case "actor3":
            return 'Incorrect actor input (must be a name and a surname given separately (f.e. Mel Brooks))'
        default:
            return 'Some incorrect input'
    }
}

module.exports = {
    async getMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovies = await movieRepository.getMovies(req.query)

            if (repoMovies.length < 10) {
                const error = await checkAllMovies(repoMovies)
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
                const error = await checkNewMovie(repoMovie)
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