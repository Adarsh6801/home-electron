const mongoose = require('mongoose');
const Objectid=mongoose.Types.ObjectId;
//product schema

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required:true,
    },
    Brand: {
        type: String,
        required:true,
    },
    Applience: {
        type: Objectid,
        ref:'appliencedata',
        required:true,
        
    },
    Category:{
        type: Objectid,
        ref:"categorydata"
    },
    Discription: {
        type: String,
        required:true,
    },
    Price: {
        type: Number,
        required:true,
    },
    image: {
        type: String,
        required:true,
    },
    Status: {
        type: String,
        required:true,
        default: 'Unblocked'
    }
    



})

module.exports = ProductModel = mongoose.model('ProductData', productSchema);