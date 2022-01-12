const md5 = require('md5');
const jwt = require('jsonwebtoken');

const User = require('../models/User')

module.exports = {
    async registerUser(userData) {
        try {
            const { name, email, password, confirmPassword } = userData

            if (!(name && email && password && confirmPassword)) return 'field'
            if (password !== confirmPassword) return 'password'
            const existingEmail = await User.findAll({
                where: {email: email}
            })
            if (existingEmail.length !== 0) return 'email'
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
        } catch (error) {
            console.error(error)
        }
    },

    async authorizeUser(userData) {
        try {
            const { email, password } = userData

            if (!(email && password)) return 'field'
            const existingEmail = await User.findAll({
                where: {email: email}
            })
            if (existingEmail.length === 0) return 'email'
            const existingPassword = await User.findAll({
                where: {password: md5(password)}
            })
            if (existingPassword.length === 0) return 'password'
            const userObj = JSON.parse(JSON.stringify(existingPassword, null, 2))[0]

            return jwt.sign(
                userObj,
                process.env.TOKEN
            );
        } catch (error) {
            console.error(error)
        }
    },
}