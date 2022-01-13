const authRepository = require('../repositories/AuthRepository')
const inputErrors = require('../errors/InputErrors')

module.exports = {

    // Registering new user
    async registerUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting new token
            const newToken = await authRepository.registerUser(req.body)

            // Checking if any error were returned while creating new user
            if (newToken.length < 20) {
                const error = await inputErrors.checkUserRegistration(newToken)
                res.status(400).send(error)
                return
            }

            res.status(201).send({token: newToken})
        } catch (error) {
            res.status(404).send(`Unable to register a new user: ${error}`)
        }
    },

    // Authorizing user
    async authorizeUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            // Getting new token
            const newToken = await authRepository.authorizeUser(req.body)

            // Checking if any error were returned while authorizing user
            if (newToken.length < 10) {
                const error = await inputErrors.checkUserAuthorization(newToken)
                res.status(400).send(error)
                return
            }

            res.status(201).send({token: newToken})
        } catch (error) {
            res.status(404).send(`Unable to login (controller): ${error}`)
        }
    },
}