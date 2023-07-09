'use strict'

const express = require('express')
const api = express.Router()
const cartController = require('./shoppingcart.controller')
const { ensureAuth, isAdmin } = require('../services/authenticated')

api.get('/test', ensureAuth, cartController.test)
api.put('/add/:id', ensureAuth, cartController.add)
api.get('/get', ensureAuth, cartController.get)

api.get('/get/:id', [ensureAuth, isAdmin], cartController.getUserCart)

module.exports = api