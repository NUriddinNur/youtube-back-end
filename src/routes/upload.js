const controller = require('../controllers/upload.js')
const router = require('express').Router()
const checkToken = require('../middlewares/checkTokin')


router.post('/videos', checkToken,  controller.UPLOAD)
router.get('/videos/admin', checkToken, controller.GET)
router.delete('/videos', checkToken, controller.DELETE)

router.put('/videos', checkToken, controller.PUT)

router.get('/download', controller.DOWNLOAD)



module.exports = router