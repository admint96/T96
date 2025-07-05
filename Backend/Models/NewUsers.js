const mongoose = require('mongoose');

const newUserSchema = new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    createdAt:{type:Date,default:Date.now},
});


module.exports = mongoose.model('NewUsers', newUserSchema);