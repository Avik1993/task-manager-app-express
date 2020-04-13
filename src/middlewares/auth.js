const jwt = require('jsonwebtoken')
const User = require('./../models/User.js')

const auth = async (req, res, next) => {
    var incomingToken = req.header('Authorization')
    try {
        if (!incomingToken) {
            throw new Error('Token Missing, Login first')
            // return res.send({data: null, error: , error: 400})
        }
        incomingToken = incomingToken.replace('Bearer ','')
        const decoded = jwt.verify(incomingToken, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': incomingToken})
        if (!user) {
            throw new Error('Invalid Token')
        }
        req.token = incomingToken
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({data: null, error: 'Please Authenticat', code: 400})
    }
}

module.exports = auth