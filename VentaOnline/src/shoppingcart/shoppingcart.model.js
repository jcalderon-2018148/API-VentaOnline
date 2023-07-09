'use strict'

const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: {
        type: Array,
        default: []
    }
},
{
    versionKey: false
})

module.exports = mongoose.model('ShoppingCart', cartSchema)