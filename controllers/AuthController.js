const authRepository = require('../repositories/AuthRepository')

async function checkUserRegistration(repoReg) {
    switch (repoReg) {
        case 'field':
            return 'All fields are required (name, email, password and passwordConfirmation)'
        case 'name':
            return 'Incorrect name (must be not an empty string) (f.e. Petro Petren)'
        case 'name2':
            return 'Incorrect name type (must be a string)'
        case 'name3':
            return 'Incorrect name (must be a name and a surname given separately (f.e. Petro Petren))'
        case 'email':
            return 'Incorrect email (must be not an empty string) (f.e. smth@gmail.com)'
        case 'email2':
            return 'Incorrect email type (must be a string)'
        case "email3":
            return 'Incorrect email (such email already exists)'
        case 'password':
            return 'Incorrect password (must be not an empty string) (f.e. pass1111)'
        case 'password2':
            return 'Incorrect password type (must be a string)'
        case "password3":
            return 'Password and passwordConfirmation must be equal'
        case 'confirmPassword':
            return 'Incorrect confirmPassword (must be not an empty string) (f.e. pass1111)'
        case 'confirmPassword2':
            return 'Incorrect confirmPassword type (must be a string)'
        case "user":
            return 'Incorrect user name (such name already exists)'
        default:
            return 'Some incorrect input'
    }
}

async function checkUserAuthorization(repoAuth) {
    switch (repoAuth) {
        case 'field':
            return 'All fields are required (email and password)'
        case 'email':
            return 'Incorrect email (must be not an empty string) (f.e. smth@gmail.com)'
        case 'email2':
            return 'Incorrect email type (must be a string)'
        case "email3":
            return 'Incorrect email (user with such email doesn\'t exist)'
        case 'password':
            return 'Incorrect password (must be not an empty string) (f.e. pass1111)'
        case 'password2':
            return 'Incorrect password type (must be a string)'
        case "password3":
            return 'Incorrect password (user with such password doesn\'t exist)'
        default:
            return 'Some incorrect input'
    }
}

module.exports = {
    async registerUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const newToken = await authRepository.registerUser(req.body)

            if (newToken.length < 20) {
                const error = await checkUserRegistration(newToken)
                res.status(400).send(error)
                return
            }

            res.status(201).send({token: newToken})
        } catch (error) {
            res.status(404).send(`Unable to register a new user: ${error}`)
        }
    },

    async authorizeUser(req, res) {
        res.header("Content-Type", 'application/json')
        try {
            const newToken = await authRepository.authorizeUser(req.body)

            if (newToken.length < 10) {
                const error = await checkUserAuthorization(newToken)
                res.status(400).send(error)
                return
            }

            res.status(201).send({token: newToken})
        } catch (error) {
            res.status(404).send(`Unable to login (controller): ${error}`)
        }
    },
}