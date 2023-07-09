'use strict'

const jwt = require('jsonwebtoken')

exports.createToken = async(user)=>{
    try{
        let payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000) + (60 * 60)
        }

        return jwt.sign(payload, `${process.env.SECRET_KEY}`)

    }catch(err){
        console.error(err)
        return err
    }
}