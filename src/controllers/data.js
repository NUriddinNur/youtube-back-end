

const GET = (req, res, next) => {
    try {

        let videos = req.readFile('videos') || []
        let users = req.readFile('users') || []

        if(req.query.search) {
            videos = videos.filter(video => video.videoTitle.toLowerCase().includes(req.query.search.toLowerCase().trim()) )
        }


        if(req.query.userId) {
            videos = videos.filter(video => video.userId == req.query.userId)
        }

		videos = videos.map(video => {
			for (let user of users) {
				if (video.userId == user.userId) {
					video.userName = user.username
					video.userImg = user.profilImg
				}
			}
			return video
		})

        users = users.map(user => {
            delete user.password
            return user
        })

        return res.status(200).json({
            status: 200,
			videos,
            users
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}



module.exports = {
	GET
}