'use strict'

const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
}, 
{
    versionKey: false
})

module.exports = mongoose.model('Categorie', categorySchema)