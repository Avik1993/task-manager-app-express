require('../../src/db/mongoose.js')
const User = require('../../src/models/User.js')
const Task = require('../../src/models/Task.js')

/*
User.findByIdAndUpdate('5e93590f567a6c1a9e5c80cb', {
    'age': 1
}) .then((user) => {
    console.log(user)
    return User.countDocuments({age: user.age})
}).then((count) => {
    console.log('Documents with age: ', count)
}).catch((error) => {
    console.log(error)
})


Task.findByIdAndDelete('5e934d7f8669ce15c43369c4').then((task) => {
    console.log(' Task deleted ', task)
    return Task.countDocuments({completed: false})
}).then((count) => {
    console.log('Documents pending are: ', count)
}).catch((error) => {
    console.log(error)
})
*/

// Using async-await
const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, {age: age})
    const count = await User.countDocuments({age: age})
    return count
}
updateAgeAndCount('5e93590f567a6c1a9e5c80cb', 2).then((count) => {
    console.log('Users with age: ', count)
}).catch((error) => {
    console.log(error)
})


// Tasks - async-await
const findAndDeleteCount = async (id) => {
    const _ = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}
findAndDeleteCount('5e9359bd74d6131ae17567d6').then((count) => {console.log('Tasks count: '+count)}).catch((error) => {console.log(error)})