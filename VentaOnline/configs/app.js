'use strict'

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000
const userRoutes = require('../src/user/user.routes')
const categoryRoutes = require('../src/category/category.routes')
const productRoutes = require('../src/product/product.routes')
const billRoutes = require('../src/bill/bill.routes')
const cartRoutes = require('../src/shoppingcart/shoppingcart.routes')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use('/user', userRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/bill', billRoutes)
app.use('/shoppingcart', cartRoutes)

exports.initServer = ()=>{
    app.listen(port)
    console.log(`Server is running in port ${port}`)
}