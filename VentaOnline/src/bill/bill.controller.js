'use strict'

const Bill = require('./bill.model')
const pdf = require('html-pdf')
const Cart = require('../shoppingcart/shoppingcart.model')
const Product = require('../product/product.model')
const User = require('../user/user.model')
const cartController = require('../shoppingcart/shoppingcart.controller')
const { validateData } = require('../utils/validate')

const userInfo = ['name', 'surname', 'email', 'phone']

exports.test = (req, res)=>{
    res.send({message: 'Test function is running'})
}

//Comprar los productos del carrito
exports.buy = async(req, res)=>{
    try{
        let user = req.user.sub
        let cart = await Cart.findOne({user: user}).populate('user')
        if(cart.products.length === 0) return res.send({message: 'There is no products in the shopping cart'})

        let products = cart.products
        let total = 0
        for(let subtotal of products){
            total = subtotal.subtotal + total
        }

        let bill = {
            user: cart.user,
            total: total,
            detail: products
        }

        let createdBill = new Bill(bill)
        await createdBill.save()
        let show = await Bill.findOne({_id: createdBill._id}).populate('user', userInfo)

        for (let product of products){
            await Product.findOneAndUpdate(
                {_id: product.id},
                {$inc: {stock: -1 * product.amount, sales: product.amount}}
            )
        }

        await cartController.cleanCart(req, res)

        return res.send({message: 'Bill created', show})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error generating bill', error: err})
    }
}

//Obtener sus propias facturas
exports.get = async(req, res)=>{
    try{
        let user = req.user.sub

        let bills = await Bill.find({user: user}).populate('user', userInfo)
        return res.send({bills})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting bills', error: err})
    }
}

//Obtener las facturas de otro usuario //Admin
exports.getUserBill = async(req, res)=>{
    try{
        let user = req.params.id

        let bills = await Bill.find({user: user}).populate('user', userInfo)

        return res.send({bills})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error getting user's bills`, error: err})
    }
}

//Obtener productos de una factura
exports.getProductsFromBill = async(req, res)=>{
    try{
        let billId = req.params.id
        let bill = await Bill.findOne({_id: billId})

        if(!bill) return res.status(404).send({message: 'Bill not found'})

        let products = bill.detail
        
        return res.send({products: products})
        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products from bill', error: err})
    }
}

//Actualizar factura //Admin
exports.update = async(req, res)=>{
    try{
        //Obtener datos
        let idBill = req.params.id
        let data = req.body

        //Obtener producto a modificar
        let product = await Product.findOne({_id: data.product})
        
        //Validar que vienen datos
        let params = {
            product: product._id,
            amount: parseInt(data.amount, 10)
        }
        let validate = validateData(params)
        if(validate) return res.status(400).send({validate})

        //Obtener factura a modificar
        let factura = await Bill.findOne({_id: idBill, detail: {$elemMatch: {id: product._id}}})
        if(!factura) return res.status(404).send({message: 'Bill or item not found'})

        //Obtener el detalle factura
        let products = factura.detail

        //Obtener la cantidad original del producto a editar
        let original
        for(let item of products){
            if(item.id.toString() !== product._id.toString()) continue

            original = item.amount
        }

        //Validar si se va a eliminar un item de la factura
        if(params.amount <= 0){
            //Actualizar factura eliminando el producto y modificando el total
            let pulledItem = await Bill.findOneAndUpdate(
                {_id: idBill},
                {
                    $pull: {detail: {id: product._id}},
                    $inc: {total: -1 * (product.price * original)}
                },
                {new: true}
            )
            .populate('user', userInfo)
            
            if(!pulledItem) return res.status(404).send({message: 'Item not found and not updated'})

            //Corregir stock
            await Product.findOneAndUpdate(
                {_id: product._id},
                {$inc: {stock: original, sales: -1 * (original)}}
            )

            return res.send({message: 'Bill updated successfully', pulledItem})
        }

        
        //Definir si se va a quitar o agregar stock
        let diference =  params.amount - original
        
        if(diference > product.stock) return res.status(400).send({message: 'There is no stock available'})
        
        //Modificar la nueva cantidad, modificar el subtotal, modificar el total
        let updatedItem = await Bill.findOneAndUpdate(
            {_id: factura._id, detail: {$elemMatch: {id: product._id}}},
            {
                "detail.$.amount": params.amount,
                "detail.$.subtotal": (product.price * params.amount),
                $inc: {
                    total: (product.price * (params.amount - original ))
                }
            },
            {new: true}
        )
        .populate('user', userInfo)
        
        //Validar que se haya actualizado
        if(!updatedItem) return res.status(404).send({message: 'Item not found and not updated'})
        
        //Corregir stock
        await Product.findOneAndUpdate(
            {_id: product._id},
            {$inc: {stock: (original - params.amount), sales: -1 * (original - params.amount)}}
        )

        return res.send({message: 'Bill updated successfully', updatedItem})
        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating bill', error: err})
    }
}

//Generar PDF
exports.generatePDF = async(req, res)=>{
    try{
        let billId = req.params.id
        let userId = req.user.sub
        let data = req.body

        let params = {
            filename: data.filename
        }
        let user = await User.findOne({_id: userId})
        if(user.role !== 'ADMIN'){
            let ownBill = await Bill.findOne({user: userId, _id: billId})
            if(!ownBill) return res.status(400).send({message: 'This bill does not belong to you'})
        }
        

        let validate = validateData(params)
        if(validate) return res.status(400).send({validate})

        let bill = await Bill.findOne({_id: billId}).populate('user', userInfo)
        let tr = ``
        let i = 0
        let products = bill.detail
        for(let product of products){
            i++
            tr += `
                <tr>
                    <td>${i}</td>
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.amount}</td>
                    <td>${product.subtotal}</td>
                </tr>
            `
        }

        let content = `
            <!DOCTYPE html>
                <head>
                    <style>
                        .main{
                            border-radius: 10px; 
                            height: 100%;
                            color: #40b6e8;
                            font-size: 50px;
                            font-family: Arial, Helvetica, sans-serif;
                        }
                        .details{
                            border-radius: 10px; 
                            height: 100%;
                            color: gray;
                            font-size: 30px;
                            font-family: Arial, Helvetica, sans-serif;
                            margin-left: 15px;
                        }
                        hr{
                            width: 98%;
                        }
                        table {
                            width: 100%; 
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 8px;
                            border: 1px solid #dee2e6;
                            font-size: 20px;
                        }
                        th {
                            height: 40px;
                            text-align: left;
                        }
                    </style>
                </head>
                <body>
                    <div>
                        <div class="main">
                            <h3>Bill</h3>
                        </div>
                        <hr>
                        <div class="details">
                            <h5>Details</h5>
                            <h6>Date: ${bill.date}</h6>
                            <table>
                                <tr>
                                    <th>User</th>
                                    <td>${bill.user.name}</td>
                                    <td>${bill.user.surname}</td>
                                    <td>${bill.user.email}</td>
                                </tr>
                            </table>
                            <br>
                            <table>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Amount</th>
                                    <th>Subtotal</th>
                                </tr>
                                ${tr}
                            </table>
                        </div>
                        
                        <br><hr><br>
                        <div class="details">
                            <h5>Total: Q${bill.total}</h5>
                        </div>
                    </div>
                </body>
        `

        pdf.create(content).toFile(`./src/bill/pdf/${data.filename}.pdf`, function(err, response){
            if(err){
                console.error(err)
            }else{
                console.log(response)
                return res.send({message: 'PDF created', response})
            }
        })
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'An error has ocurred while creating pdf', error: err})
    }
}