'use strict'

const mongoose = require('mongoose')

const billSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date()
    },
    total: {
        type: Number,
        required: true
    },
    detail: {
        type: Array,
        required: true,
        default: []
    }
},
{
    versionKey: false
})

module.exports = mongoose.model('Bill', billSchema)