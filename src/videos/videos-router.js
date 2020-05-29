require('dotenv').config();
const path = require('path');
const express = require('express');
const videosService = require('./videos-service');
const xss = require('xss');
const formData = require('express-form-data');
const { GcsFileUpload } = require('gcs-file-upload');
const fs = require('fs');

const videosRouter = express.Router();

const formDataParser = formData.parse();

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
    content: video.content,
    video_url: video.video_url,
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
    .post(formDataParser, (req, res, next) => {
        let requestData = req.files.file.path;

        const { title, content } = req.body;
        const newVideoInfo = { title, content };
        console.log(title, content, 'i am title and content');
        console.log(req.body, 'I am req.body');

        // for([key, value] of Object.entries(newVideoInfo))
        // if(value == null)
        //     return res.status(400).json({
        //         error: { message: `Missing '${key}' in request` }
        //     })

        const myFile = fs.readFileSync(requestData);

        const videoName = req.files.file.name;

  
        const fileMetaData = {
          originalname: videoName,
          buffer: myFile
        }
         
        myBucket
          .uploadFile(fileMetaData)
          .then((data) => {
            const newVideo = {
              title: title,
              content: content,
              video_url: data
            }
            // console.log(newVideo, 'I am new video data');
            
            videosService.insertVideos(
              req.app.get('db'),
              newVideo
            )
            res.send({status: "Success!"})
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