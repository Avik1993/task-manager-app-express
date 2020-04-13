const mongoose = require('mongoose')
const validator = require('validator')

/*
Mongoose Note:
Mongoose always:
    1. lowercases the collection name
    2. Pluralizes the model
and then saves it as collection 
*/


mongoose.connect(process.env.MONGOURL+'/task-manager-api', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true 
})

/* Defining User Model. */
const User = mongoose.model('User', {
    name: {
        type: String,
        required: true, 
        default: 'Default name',
        trim: true
    },
    age: {
        type: Number,
        required: true,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number')
            }
        }
    },
    interests: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        },
        unique: true,       // Will make sure all values are unique within collection
        index: true,        // Will create index on email field for search.
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('Password length should be more than 6')
            }
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain string "Password"')
            }
        }
    }
})

/* Defining new instance of User Model */
const me = new User({name: 'John', email: 'John@gmail.com', password: 'ValidPass'}) //Accepts '26' as well for Number

/*  Saving instance to DB, Returns promise   */
me.save().then((savedObject) => {
    console.log('Successfully saved data, SaveObject: ', savedObject)
}).catch((error) => {
    console.log('Unable to save data, Error :', error)
})

// Model - 2 - Tasks
const Task = mongoose.model('Task', {
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    description: {
        type: String,
        required: true,
        trim: true,
    }
})

const task1 = new Task({description: 'Pickup Pets' })

task1.save().then((savedObject) => {
    console.log('Saved Tasks to DB: ', savedObject)
}).catch((error) => {
    console.log('Error saving ojbect', error)
})