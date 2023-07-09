'use strict'

const User = require('./user.model')
const Cart = require('../shoppingcart/shoppingcart.model')
const Bill = require('../bill/bill.model')
const { encrypt, checkPassword, validateData } = require('../utils/validate')
const { createToken } = require('../services/jwt')
const userInfo = ['name', 'surname', 'email', 'phone']

exports.test = (req, res)=>{
    res.send({message: 'Test function is running'})
}

exports.defaultUser = async(req, res)=>{
    try{
        let existDefault = await User.findOne({username: 'udefault'})
        if(existDefault) return console.log('User default already created')

        let data = {
            name: 'user',
            surname: 'default',
            username: 'udefault',
            password: await encrypt('123'),
            email: 'udefault@gmail.com',
            phone: '123123',
            role: 'ADMIN'
        }

        let user = new User(data)
        
        await user.save()

        console.log('User default created successfully')

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error creating default user', error: err})
    }
}

//Registrarse
exports.register = async(req, res)=>{
    try{
        let data = req.body
        let role = data.role
        if(role) return res.status(401).send({message: 'You do not have permissions to modify this param "ROLE"'})

        data.password = await encrypt(data.password)
        data.role = "CLIENT"
        let user = new User(data)

        await user.save()
        
        let cart = {
            user: user._id
        }
        let shoppingCart = new Cart(cart)
        await shoppingCart.save()
        return res.send({message: 'Account created successfully'})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error creating account', error: err.message})
    }
}

//Loguearse
exports.login = async(req, res)=>{
    try{
        let data = req.body
        let credentials = {
            username: data.username,
            password: data.password
        }
        let msg = validateData(credentials)

        if(msg) return res.status(400).send(msg)

        let user = await User.findOne({username: data.username})

        if(user && await checkPassword(data.password, user.password)) {
            let bills = await Bill.find({user: user._id}).populate('user', userInfo)
            let token = await createToken(user)
            return res.send({message: 'User logged successfully', token, buys: bills})
        }

        return res.status(401).send({message: 'Invalid credentials'})
        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, not logged', error: err})
    }
}

//Actualizar
exports.update = async(req, res)=>{
    try{
        let data = req.body

        if(data.role && req.user.role == 'CLIENT') return res.status(401).send({message: 'You do not have permissions to update this param "ROLE"'})
        if(data.password) return res.send({message: 'You cannot update password here'})

        let updatedUser = await User.findOneAndUpdate(
            {_id: req.user.sub},
            data,
            {new: true}
        )
    
        return res.send({message: 'Your user was updated successfully', updatedUser})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, user not updated', error: err})
    }
}

//Eliminar su propia cuenta
exports.delete = async(req, res)=>{
    try{
        let idUser = req.user.sub

        let deletedUser = await User.findOneAndDelete({_id: idUser})
        if(!deletedUser) return res.status(404).send({message: 'User not found and not deleted'})
        
        res.send({message: 'User deleted successfully', deletedUser})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, user not deleted', error: err})
    }
}

//Eliminar cuenta de otro usuario //Admin
exports.deleteUser = async(req, res)=>{
    try{
        let idUser = req.params.id

        let user = await User.findOne({_id: idUser})
        if(!user) return res.status(404).send({message: 'User not found and not deleted'})
        if(user.role === 'ADMIN') return res.status(401).send({message: 'Cannot delete ADMIN'})

        let deletedUser = await User.findOneAndDelete({_id: idUser})
        
        res.send({message: 'User deleted successfully', deletedUser})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, user not deleted', error: err})
    }
}

//Actualizar password
exports.updatePassword = async(req, res)=>{
    try{
        let data = req.body
        let form = {
            password: data.password,
            newPassword: data.newPassword
        }
        let msg = validateData(form)
        if(msg) return res.status(400).send(msg)

        let user = await User.findOne({_id: req.user.sub})

        if(user && await checkPassword(data.password, user.password)) {
            await User.findOneAndUpdate(
                {_id: req.user.sub},
                {password: await encrypt(data.newPassword)}
            )

            return res.send({message: 'Password updated'})
        }

        return res.status(401).send({mesagge: 'Error, password does not coincide or user not found'})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, password not updated', error: err})
    }
}

//Crear cuenta //Admin
exports.save = async(req, res)=>{
    try{
        let data = req.body
        data.password = await encrypt(data.password)

        let params = {
            name: data.name,
            surname: data.surname,
            username: data.username,
            password: data.password,
            email: data.email,
            phone: data.phone,
            role: data.role
        }
        let validate = validateData(params)
        if(validate) return res.status(400).send({validate})

        let existUsername = await User.findOne({username: data.username})
        if(existUsername) return res.status(400).send({message: `This username '${data.username}' is already taked, please select another one`})
        
        let user = new User(data)
        await user.save()
        
        return res.send({message: 'Acount created successfully'})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error, user not added', error: err})
    }
}

//Actualizar usuario //Admin
exports.updateUser = async(req, res)=>{
    try{
        let idUser = req.params.id
        let data = req.body

        let user = await User.findOne({_id: idUser})
        if(!user) return res.status(404).send({message: 'User not found'})

        if(user.role === 'ADMIN') return res.status(401).send({message: 'Cannot update an ADMIN'})
        if(data.password) return res.status(401).send({message: 'Cannot update password'})
        
        let updatedUser = await User.findOneAndUpdate(
            {_id: idUser},
            data,
            {new: true}
        )

        return res.send({message: 'User updated successfully', updatedUser})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating user', error: err})
    }
}