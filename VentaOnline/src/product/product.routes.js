'use strict'

const express = require('express')
const api = express.Router()
const productController = require('./product.controller')
const { ensureAuth, isAdmin } = require('../services/authenticated')

api.get('/test', ensureAuth, productController.test)

api.post('/search', ensureAuth, productController.search)
api.get('/getbycategory/:id', ensureAuth, productController.getByCategory)
api.get('/popular', ensureAuth, productController.popular)

api.post('/create', [ensureAuth, isAdmin], productController.create)
api.get('/get', [ensureAuth, isAdmin], productController.get)
api.get('/get/:id', [ensureAuth, isAdmin], productController.getProduct)
api.put('/update/:id', [ensureAuth, isAdmin], productController.update)
api.get('/outofstock', [ensureAuth, isAdmin], productController.outOfStock)
api.delete('/delete/:id', [ensureAuth, isAdmin], productController.delete)


module.exports = api