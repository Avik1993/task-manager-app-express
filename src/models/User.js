const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require ('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task.js')

const userSchema = new mongoose.Schema({
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
        // Validation Middleware
        validate(value) {
            if (value.length < 6) {
                throw new Error('Password length should be more than 6')
            }
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain string "Password"')
            }
        },
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {                            // Adding options to enable timestamps (createdAt, updatedAt)
    timestamps: true
})


// Virtual property - Relationship
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',              // Creating link between local _id and foreign owner
    foreignField: 'owner'
})


/*
userSchema.statics.findByCredentials = async (email, pass) => {
    const user = User.findOne({email: email})
    if (!user) {
        throw new Error('User not found')
    }
    const isMatch = await bcrypt.compare(pass, user.password)
    if (!isMatch) {
        throw new Error('Password do not match')
    }
    return user
}*/
// Re-factored statics method
userSchema.statics = {
    /**
     * Get user by credentials
     * @param {EmailID} email - The Email of User
     * @param {Password} pass - Password for the USer
     * @returns {User}
     */
    async findByCredentials(email, pass) {
        const user = await this.findOne({ email })
        if (!user) {
            // const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
            // throw new Error('User not found')
            return Promise.reject('User not found')
        }
        const isMatch = await bcrypt.compare(pass, user.password)
        if (!isMatch) {
            // throw new Error('Password do not match')
            return Promise.reject('Password do not match')
        }
        return user    
    }
}


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1 day'})
    user.tokens = user.tokens.concat({token: token})
    await user.save()
    return token
}

userSchema.methods.getPublicProfile = function() {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

// Gets called automatically, everytime user object is stringified to be sent in response.
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

// This is binding function so cant use Arrow function
// Hash password, before saving
userSchema.pre('save', async function (next) {
    const user = this
    try {
        // We need to generate has only when 'password' has been updated specifically
        if (user.isModified('password')) {
            user.password = await bcrypt.hash(user.password, 8)
        }
        next()
    } catch (e) {
        next(new Error('Internal Error in Pre-hook for Save event'))
    }
})

// Delete user task, when user is deleted
userSchema.pre('remove', async function(next) {
    const user = this
    const deletedTasks = await Task.deleteMany({owner: user._id})
    if (!deletedTasks) {
        next(new Error('Tasks could not be deleted'))
    }
    next()
})




// Providing Schema is needed for using Middlewares
const User = mongoose.model('User', userSchema)


module.exports = User