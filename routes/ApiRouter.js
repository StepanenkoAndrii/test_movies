const router = require('express').Router()
const authRouter = require('./AuthRouter')
const movieRouter = require('./MovieRouter')
const authToken = require('../middleware/AuthMiddleware')

router.use('/movies', authToken, movieRouter)
router.use('/', authRouter)

module.exports = router