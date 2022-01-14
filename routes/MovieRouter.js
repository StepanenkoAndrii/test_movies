const router = require('express').Router()
const movieController = require('../controllers/MovieController')

router.get('/:id', movieController.getMovieById)
router.get('/', movieController.getMovies)
router.delete('/:id', movieController.deleteMovie)
router.patch('/:id', movieController.updateMovie)
router.post('/import', movieController.addImportedMovies)
router.post('/', movieController.addMovie)

module.exports = router