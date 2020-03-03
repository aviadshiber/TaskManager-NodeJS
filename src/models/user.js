const mongoose= require('mongoose')
const validator= require('validator')
const bcrypt =require('bcryptjs')
const cryptoRandomString = require('crypto-random-string')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const numOfHashRounds=8
const userSchema = new mongoose.Schema({
        name: {
            type: String,
            require: true,
            trim: true
        },
        
        password: {
            type: String,
            required: true,
            trim: true,
            minlength:7,
            validate(value){
                if(value.toLowerCase().includes('password') ) throw new Error('the password cannot contain \'password\'')
            }
        },
        salt:{  
            type: String,
            require: true,
            trim: true
        },
        email: {
            type: String,
            unique:true,
            require: true,
            lowercase: true,
            validate(value){
                if(!validator.isEmail(value) )
                    throw new Error('Email is invalid')
             }
            }
        ,
        age:{
            type: Number,
            default:0,
            validate(value){ //custom validation
                if(value<0) throw new Error('Invalid age')
            }
        },
        avatar:{
            type:Buffer
        },
        tokens: [{
            token:{
                type: String,
                require: true
            }
        }]
    
    },{
        timestamps:true
    }
    )

userSchema.virtual('tasks', {
        ref: 'Task',
        localField: '_id',
        foreignField: 'owner'
    })

userSchema.methods.toJSON = function(){
    const user = this.toObject()
    delete user.password
    delete user.tokens
    return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    payload = { _id: user._id.toString()}
    const token = jwt.sign(payload, 'secret')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return  token
}
userSchema.statics.findByCredentials= async (email,password) => {
    const user = await User.findOne({email})
    if(!user) throw new Error('email or password is invalid')

    const isMatched = await bcrypt.compare(password+user.salt,user.password)
    if(!isMatched) throw new Error('email or password is invalid')
    return user

}
    
userSchema.pre('save',async  function(next) { //using normal function and not arrow because we this binding to 'this' (the document)
        const user = this
       
        if(user.isModified('password')){
            user.password= await bcrypt.hash(user.password+user.salt,numOfHashRounds)
        }
        next()
}) 
//cascade a delete of user to his tasks
userSchema.pre('remove',async  function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)

module.exports = User