const mongoose = require('mongoose');
const Objectid = mongoose.Types.ObjectId


const oderSchema = new mongoose.Schema({

    Address : {
        type: Object,
        required: true,
        trim: true
      },
    userId : {
        type: String,
        required: true,
        trim: true
      }, 
    items : {
        type: Array,
        required: true,
        trim: true
      },
    paymentMethod : {
        type: String,
        required: true,
        trim: true
      },
    paymentStatus : {
        type: String,
        required: true,
        trim: true
      },
    orderStatus : {
        type: String,
        required: true,
        trim: true
      },
      
    totalProduct : {
        type: Number,
        required: true,
        trim: true
      },
    totalAmount : {
        type: Number,
        required: true,
        trim: true
      },
    deliveryDate : {
      type: String,
      trim: true
      }
},{ timestamps: true });


module.exports = order = mongoose.model("order", oderSchema)