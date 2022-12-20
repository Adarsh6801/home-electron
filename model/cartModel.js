const mongoose =require('mongoose')
const Objectid = mongoose.Types.ObjectId

const categorySchema= new mongoose.Schema({
    userId:{
        type:Objectid,
        ref:'User'
    },
    products:[
        {
            productId: {
                type:Objectid,
                required:true,
                ref: 'ProductData'
            },
            quantity:Number,
            name:String,
            price:Number,
            offerPrice:Number
        }
    ],
    subTotal:{
        type:Number
    },
    couponDiscount:{
        type:Number
    },
    total:{
        type:Number,
        default:0
    }
    

})
module.exports = CategoryModel = mongoose.model('cartdatas',categorySchema);