const path = require('path');
const express = require('express');
const usersService = require('./users-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
    id: user.id,
    email: user.email,
    password: user.password,
    video_id: user.video_id,
});

usersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        usersService.getAllUsers(knexInstance)
            .then(user => {
                res.json(user.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { email, password } = req.body;
        const newUser = { email, password };

        for([key, value] of Object.entries(newUser))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request` }
                })

        usersService.insertUsers(
            req.app.get('db'),
            newUser
        )
            .then(user => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                    .json(serializeUser(user))
            })
            .catch(next)
    })

foldersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        usersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    error: { message: `User does not exist` }
                })
            }
            res.user = folder;
            next()
        })
        .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })

    .patch(jsonParser, (req ,res, next) => {
        const { email, password } = req.body;
        const updatedUser = { email, password };

        const numberOfValuesEmail = Object.values(updatedUser).length
        if(numberOfValuesEmail === 0 ) {
            return res.status(400).json({
                error: { message: `The new user needs an email` }
            });
        }

        usersService.updateUsers(
            req.app.get('db'),
            updatedUser
        )
        .then(userEffected => {
            res.status(200).end()
        })
        .catch(next)
    })

    .delete((req, res, next) => {
        foldersService.deleteUsers(
            req.app.get('db'),
            req.params.user_id
        )
        .then(userEffected => {
            res.status(200).end()
        })
        .catch(next)
    })
module.exports = usersRouter