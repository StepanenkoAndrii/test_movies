const md5 = require('md5');
const jwt = require('jsonwebtoken');

const User = require('../models/User')

module.exports = {

    // Registering new user
    async registerUser(userData) {
        const {name, email, password, confirmPassword} = userData

        // Checking if not all fields were given
        if (!(name && email && password && confirmPassword)) return 'field'

        // Checking if name was given incorrectly
        if (typeof name === 'string') {
            if (name.length > 0) {
                if (name.split(' ').length < 2) return 'name3'
            } else return 'name'
        } else return 'name2'

        // Checking if email was given incorrectly
        if (typeof email === 'string') {
            if (email.length === 0) return 'email'
        } else return 'email2'

        // Checking if password was given incorrectly
        if (typeof password === 'string') {
            if (password.length === 0) return 'password'
        } else return 'password2'

        // Checking if confirmPassword was given incorrectly
        if (typeof confirmPassword === 'string') {
            if (confirmPassword.length === 0) return 'confirmPassword'
        } else return 'confirmPassword2'

        // Checking if password is not equal to confirmPassword
        if (password !== confirmPassword) return 'password3'

        // Checking if email already existed
        const existingEmail = await User.findAll({
            where: {email: email}
        })
        if (existingEmail.length !== 0) return 'email3'

        // Checking if user already existed
        const existingUser = await User.findAll({
            where: {name: name}
        })
        if (existingUser.length !== 0) return 'user'

        // Hashing password
        const encryptedPassword = md5(password)

        // Creating new user
        const user = await User.create({
            name: name,
            email: email,
            password: encryptedPassword,
        })
        const userObj = JSON.parse(JSON.stringify(user, null, 2))

        // Creating JWT using new user data
        return jwt.sign(
            userObj,
            process.env.TOKEN
        )
    },

    // Authorizing user
    async authorizeUser(userData) {
        const {email, password} = userData

        // Checking if not all fields were given
        if (!(email && password)) return 'field'

        // Checking if email was given incorrectly
        if (typeof email === 'string') {
            if (email.length === 0) return 'email'
        } else return 'email2'

        // Checking if password was given incorrectly
        if (typeof password === 'string') {
            if (password.length === 0) return 'password'
        } else return 'password2'

        // Checking if user with such email doesn't exist
        const existingEmail = await User.findAll({
            where: {email: email}
        })
        if (existingEmail.length === 0) return 'email3'

        // Checking if user with such password doesn't exist
        const existingPassword = await User.findAll({
            where: {password: md5(password)}
        })
        if (existingPassword.length === 0) return 'password3'

        const userObj = JSON.parse(JSON.stringify(existingPassword, null, 2))[0]

        // Creating JWT using found user data
        return jwt.sign(
            userObj,
            process.env.TOKEN
        )
    },
}