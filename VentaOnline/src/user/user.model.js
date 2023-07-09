'use strict'

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        uppercase: true
    }
},
{
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)