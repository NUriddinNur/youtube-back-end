const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const { sign } = require('../utils/jwt.js')
const sha256 = require('sha256')
const path = require('path')

const REGISTER = (req, res, next) => {
    try {
        const users = req.readFile('users') || []
        const { file } = req.files

        req.body.userId = users.length ? users[users.length - 1].userId + 1 : 1
        req.body.password = sha256(req.body.password)
        
        if(!['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
            new AuthorizationError(400, 'Invalid file mime type!')
		}

        if (users.find(user => user.username == req.body.username)) {
            return next(
                new AuthorizationError(400, 'The user already exists')
            )
        }
        
        const agent = req.headers['user-agent']
        const fileName = Date.now() + file.name.replace(/\s/g, "")

		const filePath = path.join(__dirname, '../', 'files', 'images', fileName)

        req.body.profilImg = "/images/" + fileName
        users.push(req.body)
        req.writeFile('users', users)
        file.mv(filePath)
    
        return res.status(201).json({
            status: 201,
            message: 'The user successfully registered!',
            profilImg: "/images/" + fileName,
            token: sign({ agent, userId: req.body.userId })
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const LOGIN = (req, res, next) => {
    try {
        const users = req.readFile('users') || []

        req.body.password = sha256(req.body.password)
        const user = users.find(user => user.username == req.body.username && user.password == req.body.password)

        if (!user) {
            return next(
                new AuthorizationError(400, 'Wrong username or password!')
            )
        }

        const agent = req.headers['user-agent']

        return res.status(200).json({
            status: 200,
            message: 'The user successfully logged in!',
            token: sign({ agent, userId: user.userId }),
            user
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    LOGIN, REGISTER
}