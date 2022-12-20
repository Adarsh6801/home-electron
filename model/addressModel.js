const mongoose =require('mongoose')
const Objectid = mongoose.Types.ObjectId

const addressSchema= new mongoose.Schema({
    userId:{
        type:Objectid,
        ref:'User'
    },
    Address:[
        {
            address:String,
            place:String,
            district:String,
            state:String,
            pincode:Number,
            phone:Number
        }
    ]
})
module.exports = CategoryModel = mongoose.model('addressdata',addressSchema);