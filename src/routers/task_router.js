const express = require('express')
const chalk = require('chalk')

const Task = require('./../models/Task.js')
const auth = require('./../middlewares/auth.js')

const taskRouter = new express.Router()

taskRouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,            // This will add all parameters from request
        owner: req.user._id
    })
    try {
        const savedObject = await task.save()
        res.status(201).send({data: savedObject, error: null, code: 200})
    } catch (e) {
        res.status(400).send({data: null, error: e, code: 400})
    }
})

// GET /tasks?completed=false
// GET /tasks?limit=10&skip=20   //Skip - number of documents not batches
// GET /tasks?sortBy=createdAt_asc
// GET /tasks?sortBy=createdAt_desc
// GET /tasks?sortBy=createdAt:desc
taskRouter.get('/tasks', auth, async (req, res) => {
    // Will accept query for 'completed'
    try {
        var match = {}
        var sortOption = {}
        /* Create match query for populate */
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'    // will set boolean based on comparison
        }
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sortOption[parts[0]] = parts[1] === 'desc' ? -1 : 1  // Ternary Operator
        }
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip),
              sort: sortOption
            //   sort: {
            //       createdAt: -1,          // 1 = ascending, 2 = descending.
            //       completed: 1
            //   }
            }
        }).execPopulate()
        // await req.user.populate('tasks').execPopulate()
        //             OR
        // const task = await Task.find({owner: req.user._id},{'__v':0})
        res.send({data: req.user.tasks, error: null, code: 200})
    } catch (e) {
        res.status(500).send({data: null, error: e, code: 500})
    }
})

taskRouter.get('/tasks/:id', auth, async (req, res) => {
    var _id = req.params.id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    if (_id.includes(',')) {
        const idArry = _id.split(',')
        _id = []
        for (var i = 0; i < idArry.length; i++) {   _id.push(idArry[i]) }
        try {
            const tasks = await Task.find({'_id': {  $in : _id}, owner: req.user._id}, {'__v':0})
            res.send({data: tasks, error: null, code: 200})
        } catch (e) {x
            res.send({data: null, error: e, code: 500})
        }
    } else {
        try {
            const tasks = await Task.findOne({_id, owner: req.user._id})
            if (!tasks) {
                throw new Error('Task not found')
            }
            // const tasks = Task.findById(_id,{'__v':0})
            res.send({data: tasks, error: null, code: 200})
        } catch (e) {
            res.status(500).send({data: null, error: 'Task not found', code: 500})
        }
    }
})




taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    var _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed','description']
    const isValid = updates.every((up) => allowedUpdates.includes(up))
    if (!isValid) {
        return res.status(400).send({data: null, error: 'Invalid update operation', code: 400})
    }
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    try {
        const updatedTask = await Task.findOne({_id, owner: req.user._id})
        if (!updatedTask) {
            throw new Error('Task not found')
        }
        updates.forEach((update) => updatedTask[update] = req.body[update])
        await updatedTask.save()
        // const updatedTask = await Task.findByIdAndUpdate(_id, completed, {new: true, runValidators: true})
        res.send({data: updatedTask, error: null, code: 200})
    } catch (e) {
        res.status(400).send({data: null, error: 'Task not found', code: 500})
    }
})




taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    try {
        const deletedTask = await Task.findOneAndDelete({_id, owner: req.user._id})
        // const deletedTask = await Task.findByIdAndDelete(_id)
        if (!deletedTask) {
            return res.status(400).send({data: null, error: 'Task not found', code: 500})
        }
        res.send({data: deletedTask, error: null, code: 200})
    } catch(e) {
        res.status(400).send({data: null, error: e, code: 500})
    }
})

module.exports = taskRouter