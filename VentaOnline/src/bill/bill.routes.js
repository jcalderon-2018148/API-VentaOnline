'use strict'

const express = require('express')
const api = express.Router()
const { ensureAuth, isAdmin } = require('../services/authenticated')
const billController = require('./bill.controller')

api.get('/test', ensureAuth, billController.test)
api.get('/buy', ensureAuth, billController.buy)
api.get('/get', ensureAuth, billController.get)
api.get('/generatepdf/:id', ensureAuth, billController.generatePDF)

api.put('/update/:id', [ensureAuth, isAdmin], billController.update)
api.get('/get/:id', [ensureAuth, isAdmin], billController.getUserBill)
api.get('/getbillproducts/:id', [ensureAuth, isAdmin], billController.getProductsFromBill)

module.exports = api