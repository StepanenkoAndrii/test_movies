const authRepository = require('../repositories/AuthRepository')

module.exports = {
    async registerUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const newToken = await authRepository.registerUser(req.body)

            res.status(201).send({token: newToken})
        } catch (error) {
            console.error(`Unable to register a new user (controller): ${error}`)
            res.status(404).send('Unable to register a new user (controller)')
        }
    },

    async authorizeUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const newToken = await authRepository.authorizeUser(req.body)

            res.status(201).send({token: newToken})
        } catch (error) {
            console.error(`Unable to login (controller): ${error}`)
            res.status(404).send('Unable to login (controller)')
        }
    },
}