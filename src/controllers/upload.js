const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')
const Datee = require('../utils/getTime.js')

const UPLOAD = (req, res, next) => {
    try {
        const videos = req.readFile('videos') || []
		let { videoTitle } = req.body
        const { file } = req.files

		videoTitle = videoTitle.trim()

		if(videoTitle.length < 1) {
			return next(
                new AuthorizationError(400, 'VideoTitle is required!')
            )
		}
		if(videoTitle.length > 30) {
			return next(
                new AuthorizationError(400, 'The name of the video should not be longer than thirty characters in length')
            )
		}
		if(!file) {
			return next(
                new AuthorizationError(400, 'he video argument is required!')
            )
		}

		const { size, mimetype} = file
		if(size > (50 * 1024 * 1024)) {
			return next(
                new AuthorizationError(400, 'Video should not be larger than 50 mb!')
            )
		}

		if(mimetype !== 'video/mp4') {
			return next(
                new AuthorizationError(400, 'The file should be mp4')
            )
		}

		const fileName = Date.now() + file.name.replace(/\s/g, "")
		const filePath = path.join(__dirname, '../', 'files', 'videos', fileName)

		const newVideo = {
			videoId: videos.length ? videos[videos.length - 1].videoId + 1 : 1,
			userId: req.userId,
			videoTitle,
			videoUrl: '/videos/' + fileName,
			videoSize: (size / (2 ** 20)).toFixed(1),
			videoCreateDate: Datee(Date.now())
		}

        videos.push(newVideo)
        req.writeFile('videos', videos)
        file.mv(filePath)

		return res.status(201).json({
			video: newVideo,
			message: "The video was successfully uploaded!"
		})

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}


const GET = (req, res, next) => {
    try {
		
        let videos = req.readFile('videos') || []
		videos = videos.filter(video => video.userId === req.userId)
        
        return res.status(200).json({
            status: 200,
			videos
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}



const DELETE = (req, res, next) => {
	try {
		let {videoId} = req.body

		if(!videoId) {
			throw new ClientError(400, "videoId is required!")
		}

		let videos = req.readFile('videos')
		const video = videos.findIndex(video => video.videoId == videoId && video.userId == req.userId)

		if(video == -1) {
			throw new ClientError(400, "Video not found!")
		}

		const [ deletVideo ] = videos.splice(video, 1)
		fs.unlinkSync(path.join(__dirname, '../', 'files', deletVideo.videoUrl))
		req.writeFile('videos', videos)

		return res.status(201).json({
			video: deletVideo,
			message:"Video is deleted!"
		})

	} catch(error) {
		return next(error)
	}
}

const DOWNLOAD = (req, res, next) => {
	try {
		const { videoPath } = req.query
		res.download( path.join(__dirname, '../', 'files', videoPath) )
	} catch(error) {
		return next(error)
	}
}

const PUT = (req, res) => {
	let { title, videoId }= req.body

	if(title[0]) {
		const videos = req.readFile('videos')

		videos.map(video => {
			console.log(title)
			if(video.videoId == videoId) {
				video.videoTitle = title
			}
		})

		return req.writeFile('videos', videos)
	}

}


module.exports = {
	DOWNLOAD,
	DELETE,
    UPLOAD,
	GET,
	PUT
}