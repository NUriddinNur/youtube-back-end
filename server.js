const fileUpload = require('express-fileupload')
const express = require('express')
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const app = express()

const PORT = process.env.PORT || 2000


app.use(express.static(path.join(__dirname, './src/files')))

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
}))

// set arguments to process
require('./src/config.js')
require('./src/utils/validation.js')

// middlewares
const modelMiddleware = require('./src/middlewares/model.js')
app.use(fileUpload())


app.use(modelMiddleware({ databasePath: path.join(__dirname, './src/database')}))
app.use(express.json())

// routes
const authRouter = require('./src/routes/auth.js')
const uploadRouter = require('./src/routes/upload.js')
const dataRouter = require('./src/routes/data.js')

app.use(authRouter)
app.use(uploadRouter)
app.use(dataRouter)


app.use((error, req, res, next) => {

    if (error.name == 'ValidationError') {
        return res.status(error.status).json({
            status: error.status,
            message: error.message.details[0].message,
            errorName: error.name,
            error: true,
        })
    }
    
    if (error.status != 500) {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            errorName: error.name,
            error: true,
        })
    }
    
    fs.appendFileSync(path.join(__dirname, './log.txt'), `${req.url}__${req.method}__${Date.now()}__${error.name}__${error.message}\n`)
    
    return res.status(error.status).json({
        status: error.status,
        message: 'Internal Server Error',
        errorName: error.name,
        error: true,
    })
})

app.listen(PORT, () => console.log('server is ready at http://192.168.0.106:' + PORT))