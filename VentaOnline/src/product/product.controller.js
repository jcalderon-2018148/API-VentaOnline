'use strict'

const { validateData } = require('../utils/validate')
const Product = require('./product.model')
const Category = require('../category/category.model')
const categoryInfo = ['name', 'description']

exports.test = (req, res)=>{
    return res.send({message: 'Test function is running'})
}

//Agregar
exports.create = async(req, res)=>{
    try{
        let data = req.body

        let params = {
            name: data.name,
            price: data.price,
            stock: data.stock,
            category: data.category
        }
        let validate = validateData(params)
        if(validate) return res.send({validate})

        let existCategory = await Category.findOne({_id: params.category})
        if(!existCategory) return res.status(404).send({message: 'Category not found'})
        
        let product = new Product(data)

        await product.save()

        return res.send({message: 'Product added correctly'})

    }catch(err){
        console.error(err)
        return res.status(500).res({message: 'Error creating product', error: err})
    }
}

//Obtener productos
exports.get = async(req, res)=>{
    try{
        let products = await Product.find().populate('category', categoryInfo)

        if(products === []) return res.status(404).send({message: 'No products added'})
        
        return res.send({message: products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products', error: err})
    }
}

//Obtener producto por id
exports.getProduct = async(req, res)=>{
    try{
        let id = req.params.id

        let product = await Product.findOne({_id: id}).populate('category', categoryInfo)
        
        return res.send({product: product})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting product', error: err})
    }
}

//Actualizar
exports.update = async(req, res)=>{
    try{
        let id = req.params.id
        let data = req.body

        if(data.category){
            let existCategory = await Category.findOne({_id: data.category})
            if(!existCategory) return res.status(404).send({message: 'Category not found'})
        }

        let udpatedProduct = await Product.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )

        if(!udpatedProduct) return res.status(404).send({message: 'Product not found and not updated'})
        return res.send({message: 'Product updated successfully', udpatedProduct})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating product', error: err})
    }
}

//Eliminar
exports.delete = async(req, res)=>{
    try{
        let id = req.params.id
        let deletedProduct = await Product.findByIdAndDelete({_id: id})

        if(!deletedProduct) return res.status(404).send({message: 'Producto not found and not deleted'})

        return res.send({message: 'Product deleted successfully', deletedProduct})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting product', error: err})
    }
}

//Obtener productos fuera de stock
exports.outOfStock = async(req, res)=>{
    try{
        let products = await Product.find({stock: 0}).populate('category')

        return res.send({products: products})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products', error: err})
    }
}

//Obtener los mas vendidos
exports.popular = async(req, res)=>{
    try{
        let products = await Product.find({
            sales: {$gt: 0}
        })
        .sort({sales: -1})
        .populate('category')
        
        return res.send({products: products})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting popular products', error: err})
    }
}

//Buscar por nombre de los productos
exports.search = async(req, res)=>{
    try{
        let data = req.body
        let params = {
            name: data.name
        }

        let validate = validateData(params)
        if(validate) return res.status(400).send({validate})

        let products = await Product.find({
            name: {
                $regex: params.name,
                $options: 'i'
            }
        }).populate('category')

        return res.send({products})
        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching products', error: err})
    }
}

//Obtener productos por su categoria
exports.getByCategory = async(req, res)=>{
    try{
        let idCategory = req.params.id
        let category = await Category.findOne({_id: idCategory})
        if(!category) return res.status(404).send({message: 'Category not found'})

        let products = await Product.find({category: category._id}).populate('category')

        return res.send({products})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products', error: err})
    }
}