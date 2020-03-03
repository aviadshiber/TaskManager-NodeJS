const express = require('express')
const router = new express.Router()
const Task= require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks',auth, async (req, res)  => {
    try{
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        
        await task.save()
        res.status(200).send(task)
    }
    catch(err) {
         res.status(404).send(err.message)
    }

})
// GET /tasks?completed=true
// GET /tasks?skip=3
// GET /tasks?limit=3
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth, async (req, res) =>{
    try{
        const sort={}
        const match={}
        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }
        if(req.query.sortBy){
            const parts= req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1
        }
        //const tasks = await Task.find({})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(err){
        res.status(500).send(err.message) 
    }
   // Task.find({}).then((tasks)=>{res.send(tasks)}).catch((err) =>res.status(500).send(err.message))
})

router.get('/tasks/:id', auth,async (req, res)=> { 
    try{
        //const task= await Task.findById(req.params.id)
        const task = await Task.findOne({_id:req.params.id,owner:req.user.id})
        res.status(200).send(task)
    }catch(err){
        res.status(404).send(err.message)
    }
    //Task.findById(req.params.id).then(t=>res.send(t)).catch((err) => res.status(404).send(err.message))
})

router.patch('/tasks/:id',auth,async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedOperations = ['description','completed']
    const isValidOperations = updates.every((update)=> allowedOperations.includes(update))
    if(!isValidOperations){
        return res.status(400).send({error: 'Invalid updates!'})
    }
    try{
         // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        const task =await Task.findOne({_id:req.params.id,owner:req.user.id})
        if(!task) return res.status(404).send()
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
    
        res.send(task)

    }catch(err){
        res.status(400).send(err.message)
    }

})



router.delete('tasks/:id', auth,async (req, res)=>{
    try{
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user.id})
        if(!task) return res.status(404).send()
        res.send(task)
    }
    catch(err){
        res.status(500).send()
    }
})


module.exports= router