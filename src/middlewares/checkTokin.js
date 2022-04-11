const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const JWT = require('../utils/jwt.js')

module.exports = (req, _, next) => {
    try {
        const { token } = req.headers
        
        if (!token) {
            return next(new AuthorizationError(401, "token is required!"))
        }

        const { agent, userId } = JWT.verify(token)
        req.userId = userId

        const reqAgent = req.headers['user-agent']

        if (reqAgent !== agent) {
            return next(new AuthorizationError(401, "token is sent from wrong device!!"))
        }

        return next()

    } catch (error) {
        return next(new AuthorizationError(401, error.message))
    }
}