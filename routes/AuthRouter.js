const router = require('express').Router()
const authController = require('../controllers/AuthController')

router.post('/users', authController.registerUser)
router.post('/sessions', authController.authorizeUser)

module.exports = router
