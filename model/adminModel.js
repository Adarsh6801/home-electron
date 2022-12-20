const mongoose = require('mongoose');
const schema = mongoose.Schema;

const adminSchema = new schema({
  
  adminName:{
    type:String,
  },
  adminPhone:{
    type:Number,
  },
  adminEmail : {
        type: String,
        required: true,
        trim: true
      },
    adminPass:{
        type: String,
        required: true,
        minlength: 6,
        trim: true
      },
      
},{ timestamps: true });



module.exports = mongoose.model('admins',adminSchema);