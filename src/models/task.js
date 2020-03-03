const mongoose= require('mongoose')

const TaskSchema=mongoose.Schema({
    name:{type: String,required:true},
    description:{type: String,trim:true},
    completed:{type: Boolean,default:false},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},
{//options
 timestamps:true
})

const Task=mongoose.model('Task',TaskSchema)

module.exports = Task