const controller = require('../controllers/data.js')
const router = require('express').Router()

router.get('/data', controller.GET)

module.exports = router