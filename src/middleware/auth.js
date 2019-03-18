require('../db/mongoose');
const user = require('../models/user');
const jwt = require('jsonwebtoken')


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        var decode = jwt.verify(token, process.env.jwtpw)
        const theuser = await user.findOne({ _id: decode._id, 'tokens.token': token })
        if (!theuser) {
            throw new Error()
        }
        console.log('authenticated');
        req.user = theuser;
        req.token=token
        next()

    } catch (E) {
        res.status(401).send('please authenticate.')
    }
}
module.exports = auth