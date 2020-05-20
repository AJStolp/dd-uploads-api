require('dotenv').config();
const path = require('path');
const express = require('express');
const videosService = require('./videos-service');
const xss = require('xss');
const formData = require('express-form-data');
const { Storage } = require('@google-cloud/storage');

const videosRouter = express.Router();
const serviceKey = path.join(__dirname, '../MyFirstProject-5f8dfbf03fd0.json');

bodyParser = formData.parse();

const storage = new Storage({
    keyFilename: serviceKey,
    projectId: 'rosy-sunspot-255301'
});

// const bucketName = storage.bucket('anthonys-bucket');
// const fileName = path.basename(localFilePath);
// const file = bucket.file(fileName);

const serializeVideo = video => ({
    id: video.id,
    date_published: video.date_published,
    title: video.title,
    content: video.name,
    rating: video.rating,
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
    .post(bodyParser, (req, res, next) => {
        let filename = req.files;
        let myJSON = JSON.stringify(filename);
        res 
            async function uploadFile() {
            // Uploads a local file to the bucket
            await storage.bucket(bucketName).upload(myJSON, {
                gzip: true,
                metadata: {
                cacheControl: 'public, max-age=31536000',
                },
            });
            videosService.insertVideos(
                req.app.get('db'),
            )

  console.log(`${myJSON} uploaded to ${bucketName}.`);
    }
    uploadFile().catch(console.error);
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