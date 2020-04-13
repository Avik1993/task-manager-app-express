const express = require('express')
const chalk = require('chalk')
const jwt = require('jsonwebtoken')

require('./db/mongoose.js')
const userRouter = require('./routers/user_router.js')
const taskRouter = require('./routers/task_router.js')

const port = process.env.PORT || 3000

const app = express()

/* json is middleware that parses incoming json bodies */
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log(chalk.yellow('Server is listening on ', port))
})

// Testing Bcrypt
/*
const bcrypt = require('bcryptjs')
const myFunction = async () => {
    const password = 'pass12345678'
    const bcryptPassword = await bcrypt.hash(password, 8) //returns Promise
    console.log('Encrypted password: ', bcryptPassword)

    const isMatch = await bcrypt.compare(password, bcryptPassword)
    if (isMatch) { console.log('Logged in')} else {console.log(false)}

} 
myFunction()
*/


// Testing JWT
/*
const myFunction = async () => {
    const token = await jwt.sign({_id: '23456trfdsf'}, 'SECRET_KEY', {expiresIn: '7 days'})
    console.log('Token generated is :', token)

    const data = jwt.verify(token, 'SECRET_KEY')
    console.log(data)
}

myFunction()
*/

// Linking Task and User - Populate
/*
const Task = require('./models/Task.js')
const User = require('./models/User.js')
const main = async () => {
    // Finding Owner of Task
    const task = await Task.findById('5e9475aa175f1148d278f696')
    await task.populate('owner').execPopulate()  //populate 'owner' from just id to whole user document
    console.log(task.owner)

    // Finding Tasks using UserId
    const user = await User.findById('5e9476dedee97b491f1364f2')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)

}
main()
*/


// Testing - Image upload
/*
const multer = require('multer')
const upload = multer({
    dest: process.env.UPLOAD_FOLDER
})
// Using 'upload.single()' Middleware
// 'upload' argument in single() function refers to key within form-data in request
app.post('/uploads', upload.single('upload'), (req, res) => {
    res.send({data: 'File uploaded'})
})
*/