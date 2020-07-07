const path = require("path");
const express = require("express");
const usersService = require("./users-service");
const { hasUserWithUsername } = require("./users-service");

const usersRouter = express.Router();
const jsonParser = express.json();
const logger = "../logger.js";

const serializeUser = (user) => ({
	id: user.id,
	email: user.email,
	username: user.name,
	password: user.password,
	video_id: user.video_id,
});

usersRouter
	.route("/")
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");
		usersService
			.getAllUsers(knexInstance)
			.then((user) => {
				res.json(user.map(serializeUser));
			})
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		const { email, password, username } = req.body;
		const newUser = { email, password, username };

		for ([key, value] of Object.entries(newUser))
			if (value == null)
				return res.status(400).json({
					error: { message: `Missing '${key}' in request` },
				});

		const passwordError = usersService.validatePassword(password);
		if (passwordError) return res.status(400).json({ error: passwordError });

		usersService
			.hasUserWithUsername(req.app.get("db"), username)
			.then((hasUserWithUsername) => {
				if (hasUserWithUsername)
					return res.status(400).json({ error: `Username already taken` });
			});
		return usersService.hashPassword(password).then((hashedPassword) => {
			const newUser = {
				username,
				password: hashedPassword,
				email,
			};
			return usersService
				.insertUsers(req.app.get("db"), newUser)
				.then((user) => {
					res
						.status(201)
						.location(path.posix.join(req.originalUrl, `/${user.id}`))
						.json(serializeUser(user));
				})
				.catch(next);
		});
	});

usersRouter
	.route("/:user_id")
	.all((req, res, next) => {
		usersService
			.getById(req.app.get("db"), req.params.user_id)
			.then((user) => {
				if (!user) {
					return res.status(404).json({
						error: { message: `User does not exist` },
					});
				}
				res.user = user;
				next();
			})
			.catch(next);
	})

	.get((req, res, next) => {
		res.json(serializeUser(res.user));
	})

	.delete((req, res, next) => {
		usersService
			.deleteUsers(req.app.get("db"), req.params.user_id)
			.then((userEffected) => {
				res.status(200).end();
			})
			.catch(next);
	});
module.exports = usersRouter;
