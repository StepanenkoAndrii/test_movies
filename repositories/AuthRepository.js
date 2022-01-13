const md5 = require('md5');
const jwt = require('jsonwebtoken');

const User = require('../models/User')

module.exports = {
    async registerUser(userData) {
        const {name, email, password, confirmPassword} = userData

        if (!(name && email && password && confirmPassword)) return 'field'

        if (typeof name === 'string') {
            if (name.length > 0) {
                if (name.split(' ').length < 2) return 'name3'
            } else return 'name'
        } else return 'name2'

        if (typeof email === 'string') {
            if (email.length === 0) return 'email'
        } else return 'email2'

        if (typeof password === 'string') {
            if (password.length === 0) return 'password'
        } else return 'password2'

        if (typeof confirmPassword === 'string') {
            if (confirmPassword.length === 0) return 'confirmPassword'
        } else return 'confirmPassword2'

        if (password !== confirmPassword) return 'password3'
        const existingEmail = await User.findAll({
            where: {email: email}
        })
        if (existingEmail.length !== 0) return 'email3'
        const existingUser = await User.findAll({
            where: {name: name}
        })
        if (existingUser.length !== 0) return 'user'
        const encryptedPassword = md5(password)
        const user = await User.create({
            name: name,
            email: email,
            password: encryptedPassword,
        })
        const userObj = JSON.parse(JSON.stringify(user, null, 2))

        return jwt.sign(
            userObj,
            process.env.TOKEN
        )
    },

    async authorizeUser(userData) {
        const {email, password} = userData

        if (!(email && password)) return 'field'

        if (typeof email === 'string') {
            if (email.length === 0) return 'email'
        } else return 'email2'

        if (typeof password === 'string') {
            if (password.length === 0) return 'password'
        } else return 'password2'

        const existingEmail = await User.findAll({
            where: {email: email}
        })
        if (existingEmail.length === 0) return 'email3'
        const existingPassword = await User.findAll({
            where: {password: md5(password)}
        })
        if (existingPassword.length === 0) return 'password3'
        const userObj = JSON.parse(JSON.stringify(existingPassword, null, 2))[0]

        return jwt.sign(
            userObj,
            process.env.TOKEN
        )
    },
}