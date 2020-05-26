require('dotenv').config();
const path = require('path');
const express = require('express');
const videosService = require('./videos-service');
const xss = require('xss');
const formData = require('express-form-data');
const { GcsFileUpload } = require('gcs-file-upload');
const fs = require('fs');

const videosRouter = express.Router();

const bodyParser = formData.parse();

const serviceKey = path.join(__dirname, '../MyFirstProject-5f8dfbf03fd0.json');

const myBucket = new GcsFileUpload({
 keyFilename: serviceKey,
 projectId: 'rosy-sunspot-255301',
}, "anthonys-bucket")

//XSS
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
        let requestData = req.files.file.path;
        
        const myFile = fs.readFileSync(requestData);
  
        const correctedPath = path.normalize(myBucket.apiEndpoint + '/' + requestData);
  
        const fileMetaData = {
          originalname: correctedPath,
          buffer: myFile
        }
         
        myBucket
          .uploadFile(fileMetaData)
          .then((data) => {
            console.log(data)
          })
          .catch((err) => {
            console.log(err)
          })
            
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
                    error: { message: `Video does not exist` }
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