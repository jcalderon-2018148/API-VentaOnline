'use strict'

require('dotenv').config()
const app = require('./configs/app')
const mongoConfig = require('./configs/mongo')
const defaultCategory = require('./src/category/category.controller')
const defaultUser = require('./src/user/user.controller')

mongoConfig.connect()
app.initServer()
defaultCategory.createDefault()
defaultUser.defaultUser()