'use strict'

const categoryController = require('./category.controller')
const express = require('express')
const { ensureAuth, isAdmin } = require('../services/authenticated')
const api = express.Router()

// api.get('/test', categoryController.test)
api.get('/test', categoryController.test)

api.get('/get', ensureAuth, categoryController.getCategories)
api.get('/get/:id', ensureAuth, categoryController.getCategory)

api.post('/add', [ensureAuth, isAdmin], categoryController.addCategory)
api.put('/update/:id', [ensureAuth, isAdmin], categoryController.updateCategory)
api.delete('/delete/:id', [ensureAuth, isAdmin], categoryController.deleteCategory)

module.exports = api