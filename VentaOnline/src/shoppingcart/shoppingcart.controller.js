'use strict'

const Product = require('../product/product.model')
const Cart = require('./shoppingcart.model')
const userInfo = ['name', 'surname', 'email', 'phone']

exports.test = (req, res)=>{
    return res.send({message: 'Test function is running'})
}

exports.add = async(req, res)=>{
    try{
        let idProduct = req.params.id
        let data = req.body
        let user = req.user.sub

        let existProduct = await Product.findOne({_id: idProduct})
        if(!existProduct) return res.status(404).send({message: 'Product not found'})

        let products = await Cart.findOne({user: user}).lean()
        let listCart = products.products
        
        for(let item of listCart){
            //validar si el id del item del carrito es igual al del producto que se esta agregando
            if(item.id.toString() !== idProduct) continue

            //validar si hay stock
            let totalAmount = item.amount + parseInt(data.amount, 10)

            if(totalAmount <= 0){
                let pulledProduct = await Cart.findOneAndUpdate(
                    {user: user},
                    {$pull: {products: {id: item.id}}},
                    {new: true}
                )

                if(!pulledProduct) return res.status(404).send({message: 'Product not found'})
                return res.send({message: 'Product deleted successfully', pulledProduct})
            }

            if(totalAmount > existProduct.stock) return res.status(400).send({message: 'There is no stock enough, please try again'})
            
            //Actualizar la cantidad y el subtotal
            let product = await Cart.findOneAndUpdate(
                {user: user, products: {$elemMatch: {id: item.id}}}, //"products.$.id": item.id
                {$inc: {"products.$.amount": parseInt(data.amount, 10), "products.$.subtotal": (data.amount * item.price)}},
                {new: true}
            )
            
            if(!product) return res.status(404).send({message: 'Error', product})
            return res.send({message: 'Product added successfully', product})
            
        }
        
        if(parseInt(data.amount, 10) > existProduct.stock) return res.send({message: 'There is no stock enough, please try again'})
        if(parseInt(data.amount, 10) <= 0) return res.status(400).send({message: 'You should set a quantity greater than 0'})

        let productCart = {
            id: existProduct._id,
            name: existProduct.name,
            price: existProduct.price,
            amount: parseInt(data.amount, 10),
        }
        productCart.subtotal = productCart.amount * productCart.price

        let cart = await Cart.findOneAndUpdate(
            {user:  user}, 
            {$push: {products: productCart}},
            {new: true}
        )
        
        return res.send({message: 'Product added successfully', cart})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error adding product to shopping cart', error: err})
    } 
}

exports.get = async(req, res)=>{
    try{
        let id = req.user.sub
        let cart = await Cart.findOne({user: id})
        if(!cart) return res.status(404).send({message: 'Shopping cart not found'})

        return res.send({ShoppingCart: cart})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products of shopping cart', error: err})
    }
}

exports.getUserCart = async(req, res)=>{
    try{
        let userId = req.params.id
        let userCart = await Cart.findOne({user: userId}).populate('user', userInfo)
        if(!userCart) return res.status(404).send({message: 'Shopping cart not found'})

        return res.send({ShoppingCart: userCart})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error getting user's cart`})
    }
}

exports.cleanCart = async(req, res)=>{
    try{
        let user = req.user.sub

        let cart = await Cart.findOne({user: user})
        let products = cart.products
        for(let product of products){
            await Cart.findOneAndUpdate(
                {user: user},
                {$pull: {products: {id: product.id}}}
            )
        }
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error cleaning cart', error: err})
    }
}