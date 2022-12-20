const mongoose =require('mongoose')

const applienceSchema= new mongoose.Schema({
    Applience: {
        type: String,
        required: true
    }
})
module.exports = ApplienceModel = mongoose.model('appliencedata',applienceSchema);