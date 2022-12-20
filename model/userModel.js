const mongoose= require('mongoose')
const Objectid = mongoose.Types.ObjectId
//user schema
const UserSchema=new mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String
    },
    email:{
        type:String
    },
    
    password:{
        type:String
    },
    repassword:{
        type:String
    },
    phone:{
        type:String
    },
    userAddress:{
        type:String
    },
    status:{
        type:String,
        default: 'Unblocked'
    },
    Address:{
        type:Array
    },
    Coupon:{
        type: Array
      },
      applyCoupon : {
        type: Boolean,
        default:false
      },
      usedCoupon:{
        type: Array
      },
},{ timestamps: true });

let User=mongoose.model('User',UserSchema);
module.exports=User;