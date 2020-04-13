const express = require('express')
const chalk = require('chalk')

// Just requiring a file, makes sure its run so it will connect 
require('./db/mongoose.js')
const User = require('./models/User.js')
const Task = require('./models/Task.js')

const port = process.env.PORT || 3000

const app = express()
/* json is middleware that parses incoming json bodies */
app.use(express.json())


app.post('/users', (req, res) => {
    const user = new User(req.body)
    user.save().then((savedObject) => {
        res.send({data: savedObject, error: null, code: 200})
    }).catch((error) => {
        res.status(400).send({data: null, error: error.errmsg, code: 400})
    })
})

app.post('/tasks', (req, res) => {
    const task = new Task(req.body)
    task.save().then((savedObject) => {
        res.send({data: savedObject, error: null, code: 200})
    }).catch((error) => {
        res.status(400).send({data: null, error: error.errmsg, code: 400})
    })
})

app.get('/tasks', (req, res) => {
    Task.find({},{'__v':0}).then((tasks) => {
        res.send({data: tasks, error: null, code: 200})
    }).catch((error) => {
        res.status(500).send({data: null, error: error.errmsg, code: 500})
    })
})

app.get('/users', (req, res) => {
    User.find({},{'_id':0, '__v':0, 'password':0}).then((users) => {
        res.send({data: users, error: null, code: 200})
    }).catch((error) => {
        res.status(500).send({data: null, error: error.errmsg, code: 500})
    })
})

app.get('/users/:emailId', (req, res) => {
    const email = req.params.emailId
    if (!email) {
        return res.status(500).send({data: null, error: 'Provide Email ID', code: 500})
    }
    User.findOne({'email': email},{'__v':0, 'password':0}).then((users) => {
        res.send({data: users, error: null, code: 200})
    }).catch((error) => {
        res.status(500).send({data: null, error: error.errmsg, code: 500})
    })
})

app.get('/usersId/:id', (req, res) => {
    const _id = req.params.id
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    if (_id.length != 24) {
        return res.status(400).send({data: null, error: 'Invalid ID format', code: 400})
    }
    User.findById(_id,{'__v':0, 'password':0}).then((user) => {
        if (!user) {
            return res.status(404).send({data: null, error: 'User not found', code: 404})
        }
        res.send({data: user, error: null, code: 200})
    }).catch((error) => {
        console.log('Failing here: ', error)
        res.status(500).send({data: null, error: error.errmsg, code: 500})
    })
})


// Challenge: Get task by id
app.get('/tasks/:id', (req, res) => {
    var _id = req.params.id
    console.log('ID: ', _id)
    if (!_id) {
        return res.status(500).send({data: null, error: 'Provide ID', code: 500})
    }
    if (_id.includes(',')) {
        const idArry = _id.split(',')
        _id = []
        for (var i = 0; i < idArry.length; i++) {
            _id.push(idArry[i])
        }
        console.log('Computed id: ', _id)
        Task.find({'_id': {  $in : _id}}, {'__v':0}).then((tasks) => {
            res.send({data: tasks, error: null, code: 200})
        }).catch((error) => {
            res.send({data: null, error: error.errmsg, code: 500})
        })
    } else {
        Task.findById(_id,{'__v':0}).then((tasks) => {
            res.send({data: tasks, error: null, code: 200})
        }).catch((error) => {
            res.status(500).send({data: null, error: error.errmsg, code: 500})
        })    
    }
})

app.listen(port, () => {
    console.log(chalk.yellow('Server is listening on ', port))
})