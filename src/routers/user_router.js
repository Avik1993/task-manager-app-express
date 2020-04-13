const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('./../models/User.js')
const authMiddleware = require('./../middlewares/auth.js')
// const { sendWelcomeEmail } = require('./../emails/account.js')

const userRouter = new express.Router()

// Upload profile
const upload = multer({
    //dest: process.env.UPLOAD_FOLDER,      //When 'dest' is not used, it wont save on local, but pass in the post method accessed using 'req.file.buffer'
    limits: {
        fileSize: 8000000                   // 8MB (Given in bytes)
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            cb(new Error('File must be png | jpeg'))
        }
        cb(undefined, true) 
    }
})

// Using 'upload.single()' Middleware, 'upload' argument in single() function refers to key within form-data in request
userRouter.post('/users/me/avatar', authMiddleware, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 60, height: 60}).png().toBuffer()
    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()
    res.send({data: 'File uploaded', error: null, code: 200})
}, (error, req, res, next) => {         // Handle error thrown by post method
    res.status(400).send({data: null, error: error.message, code: 400})
})


// Delete /users/me/avatar - Delete Avatar
userRouter.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send({data: 'Avatar deleted', error: null, code: 200})
}, (error, req, res, next) => {
    res.status(500).send({data: null, error: error.message, code: 500})
})


// Server avatar in UI
userRouter.get('/users/:id/avatar', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send({data: null, error: 'Cannot find Avatar', code: 500})
    }
}, (error, req, res, next) => {
    res.status(500).send({data: null, error: error.message, code: 500})
})

// signup
userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({data: user.getPublicProfile(), token: token, error: null, code: 200})
    } catch(e) {
        res.send({data: null, error: e, code: 500})
    }
})

userRouter.post('/users/logout', authMiddleware, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token.trim() !== req.token.trim()
        })
        await req.user.save()
        res.send({data: 'Logged out', error: null, code: 200})
    } catch(e) {
        console.log('Error: ', e)
        res.status(500).send({data: null, error: e, code: 500})
    }
})

userRouter.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const savedObject = await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({data: savedObject, token: token, error: null, code: 200})
    } catch (e) {
        res.status(400).send({data: null, error: e, code: 400})
    }
})

// Adding auth middleware
userRouter.get('/users', authMiddleware, async (req, res) => {
    try {
        const user = await User.find({},{'_id':0, '__v':0, 'password':0})
        res.send({data: user, error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})

// Adding auth middleware
userRouter.get('/users/me', authMiddleware, async (req, res) => {
    try {
        /* Auth Middleware is setting 'user' proerty */
        res.send({data: req.user.getPublicProfile(), error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})

/*
userRouter.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    try {
        const user = await User.findById(_id,{'__v':0, 'password':0})
        res.send({data: user, error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})*/

userRouter.get('/usersId/:id', async (req, res) => {
    const _id = req.params.id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    if (_id.length != 24) {
        return res.status(400).send({data: null, error: 'Invalid ID format', code: 400})
    }
    try {
        const user = await User.findById(_id,{'__v':0, 'password':0})
        if (!user) {
            return res.status(404).send({data: null, error: 'User not found', code: 404})
        }
        res.send({data: user, error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})

// Update your own account
userRouter.patch('/users/me', authMiddleware, async (req, res) => {
    var _id = req.user._id
    // Adding validator for what all can be updated
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValid = updates.every((up) => allowedUpdates.includes(up))
    if (!isValid) {
        return res.status(400).send({data: null, error: 'Invalid update operation', code: 400})
    }
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    try {
        const updatedUser = req.user
        updates.forEach((update) => updatedUser[update] = req.body[update])
        await updatedUser.save(function (err, doc, next) {
            if (err) {
                return res.status(500).send({data: null, error: 'Error while updating User', code: 500})
            }
            if (!updatedUser) {
                return res.status(404).send({data: null, error: 'User not found', code: 404})
            }
            res.send({data: updatedUser, error: null, code: 200})    
        })
        // await updatedUser.save()
        // if (!updatedUser) {
        //     return res.status(404).send({data: null, error: 'User not found', code: 404})
        // }
        // res.send({data: updatedUser, error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})


userRouter.delete('/users/me', authMiddleware, async (req, res) => {
    const _id = req.user._id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    try {
        await req.user.delete()
        res.send({data: req.user.getPublicProfile(), error: null, code: 200})
    } catch(e) {
        res.status(400).send({data: null, error: e, code: 500})
    }
})


module.exports = userRouter