const mongoose = require('mongoose');
const validator = require('validator');
const taskscheme = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})
taskscheme.pre('save', function () {
   console.log('pre save');
})
taskscheme.pre('findOne', function () {
    console.log('pre findone');
 })
const Task = mongoose.model('Task', taskscheme)

module.exports = Task;