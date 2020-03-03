const express = require('express');
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 5000
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port , () => {
    console.log('Server listening on',port)
})


// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     const task = await Task.findById('5e5ceb67a3d51677f0cfb001')
//     await task.populate('owner').execPopulate()
//     console.log("owner:",task.owner)

//     // const user = await User.findById('5e5cd6c49d7cf167487c59e5')
//     // await user.populate('tasks').execPopulate()
//     // console.log(user.tasks)
// }

// main()