'use strict'

const Category = require('./category.model')
const Product = require('../product/product.model')

exports.test = (req, res)=>{
    return res.send({message: 'Test function is running'})
}

//Crear categoria default
exports.createDefault = async()=>{
    try{
        let existDefault = await Category.findOne({name: 'DEFAULT'})
        if(existDefault) return console.log('Default category already created')

        let data = {
            name: 'DEFAULT',
            description: 'Default category'
        }

        let category = new Category(data)
        await category.save()
        return console.log('Category default does not exist, creating...')
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error creating category default', error: err})
    }
}

//Agregar categoria
exports.addCategory = async(req, res)=>{
    try{
        let data = req.body
        let existCategory = await Category.findOne({name: data.name}) 
        if (existCategory) {
            return res.send({message: `Category '${data.name}' already exist`})
        }

        let category = new Category(data)
        await category.save();
        return res.status(201).send({message: 'Created category'}) 

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error saving category', error: err}) 
    }
    
}

//Obtener categorias 
exports.getCategories = async(req, res)=>{
    try{
        let categories = await Category.find()
        return res.send({message: 'Categories found', categories})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting categories', error: err})
    }
}

//Obtener categoria por id
exports.getCategory = async(req, res) =>{
    try{
        let categoryId = req.params.id
        let category = await Category.findOne({_id: categoryId}) 
        if (!category) return res.status(404).send({message: 'Category not found'})

        return res.send({message: 'Category found', category})
    }catch(err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting category', error: err})
    }
}

//update
exports.updateCategory = async(req, res)=>{
    try{
        let categoryId = req.params.id 
        let data = req.body
        let existCategory = await Category.findOne({name: data.name}).lean()
        
        if(existCategory) {
            if(existCategory.name === 'DEFAULT') return res.status(400).send({message: 'Cannot update default category'})
            if(existCategory._id != categoryId) return res.send({message: 'Category already created'})

            let updatedCategory = await Category.findOneAndUpdate(
                {_id: categoryId},
                data,
                {new: true}
            )
    
            if(!updatedCategory) return res.status(404).send({message: 'Category not found and not updated'})
            return res.send({message: 'Category updated', updatedCategory})
        }
        
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: categoryId},
            data,
            {new: true}
        )

        if(!updatedCategory) return res.status(404).send({message: 'Category not found and not updated'})
        return res.send({message: 'Category updated', updatedCategory})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating category', error: err})
    }
}

//eliminar
exports.deleteCategory = async(req, res)=>{
    try{
        let categoryId = req.params.id

        let def = await Category.findOne({name: 'DEFAULT'})

        if(categoryId == def._id) return res.send({message: 'Cannot delete default category'})

        let deletedCategory = await Category.findOneAndDelete({_id: categoryId})
        if(!deletedCategory) return res.status(404).send({message: 'Category not found and not deleted'})


        await Product.updateMany(
            {category: categoryId},
            {category: def._id}
        )

        return res.send({message: 'Category deleted successfully', deletedCategory})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting category', error: err})
    }
}
