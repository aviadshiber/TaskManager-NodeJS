const express = require('express')
const router = new express.Router()
const User= require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail , sendCancellationEmail } = require('../emails/account')


const uploadMiddleware = multer({ 
    //dest: 'avatars/' ,
    limits: {
        fileSize: 1000000 //For multipart forms, the max file size (in bytes)
    },
    fileFilter(req,file,callback){
        if(!file.originalname.toLowerCase().match(/\.(gif|jpeg|jpg|png)$/)){
            return callback(new Error("file format is not allowed, choose an image"))
        }
        return callback(undefined,true)
    }
})
router.post('/users/me/upload',auth ,uploadMiddleware.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
}, (error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/upload',auth ,uploadMiddleware.single('avatar'), async (req,res)=>{
    req.user.avatar=undefined
    sendCancellationEmail(req.user.name,req.user.email)
    await req.user.save()
    res.send()
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
}, (error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar',async  (req, res) =>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set("Content-Type","image/jpg")
        res.send(user.avatar)
    }catch(err){
        res.status(400).send()
    }
})

router.post('/users',async  (req, res) => {
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        try{sendWelcomeEmail(user.name,user.email)}catch(err){return res.status(500).send()}
        return res.status(201).send({user,token})
    }catch(err){
        console.log(err)
        return res.status(400).send()
    }
  })

router.post('/users/login',async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(err){
        console.log(err)
        return res.status(400).send()
    }
})

router.post('/users/logout',auth,async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((tokenRecord)=>{
            return tokenRecord.token !== req.token
        })
        await req.user.save()
        return res.send()
    }catch(err){
        return res.status(500).send()
    }
})

router.post('/users/invalidateAll',auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        return res.send()
    }catch(err){
        return res.status(500).send()
    }
})

router.patch('/users/me', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.user._id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})
  
  router.get('/users/me',auth, async (req, res) => {
      res.send(req.user)
  })
  
//   router.get('/users/:id',auth ,(req, res) => {
//       User.findById({_id: req.params.id}).then((user) =>res.send(user)).catch((err) =>res.status(404).send(err.message))
//   })

  router.delete('/users/me',auth, async (req, res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user) return res.status(404).send()
        await req.user.remove()
        res.send(req.user)
    }catch(err){
        return res.status(500).send()
    }
})
module.exports= router