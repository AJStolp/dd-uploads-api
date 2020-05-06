const path = require('path');
const express = require('express');
const videosService = require('./videos-service');

const videosRouter = express.Router();
const jsonParser = express.json();

const serializeVideo = video => ({
    id: video.id,
    date_published: video.date_published,
    title: video.title,
    content: video.name,
    rating: video.rating
});

videosRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        videosService.getAllVideos(knexInstance)
            .then(video => {
                res.json(video.map(serializeVideo))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, content, rating } = req.body;
        const newVideo = { title, content, rating };

        for([key, value] of Object.entries(newVideo))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request` }
                })

        videosService.insertVideos(
            req.app.get('db'),
            newVideo
        )
            .then(video => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${video.id}`))
                    .json(serializeVideo(video))
            })
            .catch(next)
    })

videosRouter
    .route('/:video_id')
    .all((req, res, next) => {
        videosService.getById(
            req.app.get('db'),
            req.params.video_id
        )
        .then(video => {
            if(!video) {
                return res.status(404).json({
                    error: { message: `Folder does not exist` }
                })
            }
            res.video = video;
            next()
        })
        .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeVideo(res.video))
    })

    .delete((req, res, next) => {
        videosService.deleteVideos(
            req.app.get('db'),
            req.params.video_id
        )
        .then(videoEffected => {
            res.status(200).end()
        })
        .catch(next)
    })
module.exports = videosRouter