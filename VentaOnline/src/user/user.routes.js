'use strict'

const express = require('express')
const api = express.Router()
const userController = require('./user.controller')
const { ensureAuth, isAdmin } = require('../services/authenticated')

api.get('/test', ensureAuth, userController.test)

api.post('/register', userController.register)
api.post('/login', userController.login)

api.put('/update', ensureAuth, userController.update)
api.put('/updatePassword', ensureAuth, userController.updatePassword)
api.delete('/delete', ensureAuth, userController.delete)

api.post('/save', [ensureAuth, isAdmin], userController.save)
api.put('/update/:id', [ensureAuth, isAdmin], userController.updateUser)
api.delete('/delete/:id', [ensureAuth, isAdmin], userController.deleteUser)

module.exports = api