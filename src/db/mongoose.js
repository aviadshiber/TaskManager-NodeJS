const mongoose= require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true
})




// const me= new User({
//     name: 'Aviad',
//     password:'pass123456',
//     email:'aviad@example.com',
//     age:'29'
// })

// me.save().then((model)=>{console.log('saved aviad in db',model)})
// .catch((err)=>{console.log(err)})

// const newTask=new Task({
//     name: 'buy',
//     description:'tea',
//     completed:false
// }).save().then((task)=>{console.log(task)}).catch((err)=>{console.log(err)})

