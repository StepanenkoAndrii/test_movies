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

module.exports = {
    async getMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovies = await movieRepository.getMovies(req.query)
            const movies = await getAllRefactoredMovies(repoMovies)

            res.status(200).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            console.error(`Unable to get all movies (controller): ${error}`)
            res.status(404).send('Unable to get all movies (controller)')
        }
    },

    async addMovie(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const movie = await movieRepository.addMovie(req.body)
            const refactoredMovie = await getRefactoredMovie(JSON.parse(movie))

            res.status(201).send(refactoredMovie)
        } catch (error) {
            console.error(`Unable to add a new movie (controller): ${error}`)
            res.status(404).send('Unable to add a new movie (controller)')
        }
    },

    async deleteMovie(req, res) {
        try {
            const movie = await movieRepository.deleteMovie(req.body.id)

            if (movie !== 0) res.status(201).send('Movie has been successfully deleted')
        } catch (error) {
            console.error(`Unable to delete a movie (controller): ${error}`)
            res.status(404).send('Unable to delete a movie (controller)')
        }
    },

    async getMovieById(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const movie = await movieRepository.getMovieById(req.params.id)
            const refactoredMovie = await getRefactoredMovie(JSON.parse(movie)[0])

            res.status(200).send(refactoredMovie)
        } catch (error) {
            console.error(`Unable to get a movie by its id (controller): ${error}`)
            res.status(404).send('Unable to get a movie by its id (controller)')
        }
    },

    // async getMoviesByName(req, res) {
    //     res.header("Content-Type", 'application/json')
    //     try {
    //         const repoMovies = await movieRepository.getMovieByName(req.params.name)
    //         const movies = await getAllRefactoredMovies(repoMovies)
    //
    //         res.status(200).send(movies)
    //     } catch (error) {
    //         console.error(`Unable to get a movie by its name (controller): ${error}`)
    //         res.status(404).send('Unable to get a movie by its name (controller)')
    //     }
    // },
    //
    // async getMoviesByActorName(req, res) {
    //     res.header("Content-Type", 'application/json')
    //     try {
    //         const repoMovies = await movieRepository.getMoviesByActorName(req.params.name)
    //         const movies = await getAllRefactoredMovies(repoMovies)
    //
    //         res.status(200).send(JSON.stringify(movies, null, 2))
    //     } catch (error) {
    //         console.error(`Unable to get a movie by actor's name (controller): ${error}`)
    //         res.status(404).send('Unable to get a movie by actor\'s name (controller)')
    //     }
    // },

    async addImportedMovies(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const repoMovies = await movieRepository.addImportedMovies()
            const movies = await getAllRefactoredMovies(JSON.stringify(repoMovies, null, 2))

            res.status(201).send(JSON.stringify(movies, null, 2))
        } catch (error) {
            console.error(`Unable to import movies (controller): ${error}`)
            res.status(404).send('Unable to import movies (controller)')
        }
    }
}