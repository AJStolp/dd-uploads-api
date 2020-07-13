require("dotenv").config();

const path = require("path");
const express = require("express");
const videosService = require("./videos-service");

const { requireAuth } = require("../middleware/jwt.auth");
const xss = require("xss");
const formData = require("express-form-data");

const { GcsFileUpload } = require("gcs-file-upload");
const fs = require("fs");

const videosRouter = express.Router();
const formDataParser = formData.parse();

const serviceKey = path.join(__dirname, "../credentials.json");

const myBucket = new GcsFileUpload(
	{
		keyFilename: serviceKey,
		projectId: "rosy-sunspot-255301",
		credentials: {
			private_key: process.env.GOOGLE_APPLICATION_CREDENTIALS.private_key,
			client_email: process.env.GOOGLE_APPLICATION_CREDENTIALS.client_email,
			project_id: process.env.GOOGLE_APPLICATION_CREDENTIALS.project_id,
			private_key_id: process.env.GOOGLE_APPLICATION_CREDENTIALS.private_key_id,
			private_key: process.env.GOOGLE_APPLICATION_CREDENTIALS.private_key,
			client_id: process.env.GOOGLE_APPLICATION_CREDENTIALS.client_id,
			auth_uri: process.env.GOOGLE_APPLICATION_CREDENTIALS.auth_uri,
			token_uri: process.env.GOOGLE_APPLICATION_CREDENTIALS.token_uri,
			auth_provider_x509_cert_url: process.env.GOOGLE_APPLICATION_CREDENTIALS.auth_provider_x509_cert_url,
			client_x509_cert_url: process.env.GOOGLE_APPLICATION_CREDENTIALS.client_x509_cert_url
		}
	},
	"anthonys-bucket"
);

//XSS
const serializeVideo = (video) => ({
	id: video.id,
	date_published: video.date_published,
	title: video.title,
	content: video.content,
	video_url: video.video_url,
});

videosRouter
	.route("/")
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");
		videosService
			.getAllVideos(knexInstance)
			.then((video) => {
				res.json(video.map(serializeVideo));
			})
			.catch(next);
	})
	.post(requireAuth, formDataParser, (req, res, next) => {
		let requestData = req.files.file.path;

		const { title, content } = req.body;
		const videoData = { title, content };

		for (const [key, value] of Object.entries(videoData))
			if (value == null)
				return res.status(400).json({
					error: { message: `Missing '${key}' in request` },
				});

		logger.info(`Video with ${title} and ${content} created`);
		const myFile = fs.readFileSync(requestData);

		const videoName = req.files.file.name;

		const fileMetaData = {
			originalname: videoName,
			buffer: myFile,
		};
		myBucket
		.uploadFile(fileMetaData)
		.then((data) => {
			const newVideo = {
				title: title,
				content: content,
				video_url: data,
			};
				videosService.insertVideos(req.app.get("db"), newVideo);
				res.send({ status: "Success!" });
			})
			.catch((err) => {
				err;
			});
	});

videosRouter
	.route("/:video_id")
	.all((req, res, next) => {
		videosService
			.getById(req.app.get("db"), req.params.video_id)
			.then((video) => {
				if (!video) {
					return res.status(404).json({
						error: { message: `Video does not exist` },
					});
				}
				res.video = video;
				next();
			})
			.catch(next);
	})

	.get((req, res, next) => {
		res.json(serializeVideo(res.video));
	})

	.delete((req, res, next) => {
		videosService
			.deleteVideos(req.app.get("db"), req.params.video_id)
			.then((videoEffected) => {
				res.status(200).end();
			})
			.catch(next);
	});

module.exports = videosRouter;
