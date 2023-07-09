'use strict'

const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    sales: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie',
        required: true
    }
},
{
    versionKey: false
})

module.exports = mongoose.model('Product', productSchema)