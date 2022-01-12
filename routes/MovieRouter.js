const router = require('express').Router()
const movieController = require('../controllers/MovieController')

router.get('/:id', movieController.getMovieById)
router.get('/', movieController.getMovies)
// router.get('/findByName/:name', movieController.getMoviesByName)
// router.get('/findByActorName/:name', movieController.getMoviesByActorName)
router.post('/import', movieController.addImportedMovies)
router.post('/', movieController.addMovie)
router.delete('/', movieController.deleteMovie)

module.exports = router