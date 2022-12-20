const mongoose =require('mongoose')

const categorySchema= new mongoose.Schema({
    Category: {
        type: String,
        required: true
    }
})
module.exports = CategoryModel = mongoose.model('categorydata',categorySchema);