const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.status(401).send('No token - no access')
    jwt.verify(token, process.env.TOKEN, (error, decodedToken) => {
        if (error) return res.status(403).send('Token not valid')
        req.decodedToken = decodedToken
        next()
    })
}