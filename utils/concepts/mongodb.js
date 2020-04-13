const chalk = require('chalk')
const {MongoClient, ObjectID } = require('mongodb')

const connectionURL = process.env.MONGOURL
const databaseName = 'task-app'

// const id = new ObjectID()
// console.log('_id generated is : ', id)

MongoClient.connect(connectionURL, { 
                    useNewUrlParser: true,
                    useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log(chalk.red('Unable to connect with MongoDB Database'))
    }
    console.log(chalk.green('Connected to MongoDB'))
    const db = client.db(databaseName)

    
    db.collection('users').insertOne({
        name: 'avik',
        company: 'Scienaptic'
    }, (error, result) => {
        // result - contains actual inserted data along with _id
        if (error) {
            return console.log(chalk.yellow('Unable to insert'))
        }
        // console.log(chalk.green(result))
        // {"result":{"ok":1,"n":1},
        // "connection":{"_events":{},"_eventsCount":4,"id":1,"address":"<IP>:27017","bson":{},"socketTimeout":360000,"monitorCommands":false,"closed":false,"destroyed":false,"lastIsMasterMS":316},
        // "ops":[{"name":"avik","company":"Scienaptic","_id":"<ID>"}],
        // "insertedCount":1,"insertedId":"<ID>","ok":1,"n":1}
        

    })
    

    db.collection('users').insertMany([
        {
            name: 'Jen',
            age: 26
        },
        {
            name: 'Gunther',
            age: 27
        }
    ], (error, result) => {
        if (error) { return console.log(chalk.red('Unable to add multiple documents'))}
        console.log(result.ops)         // ops - contain all documents inserted
    })

    // Query
    db.collection('users').findOne({name: 'avik'}, (error, result) => {
        if (error) {
            console.log(chalk.red('No user with avik name'))
        }
        console.log('findOne: ', result)
        //{ _id: <ID>, name: 'avik', company: 'Scienaptic' }
    })

    // find - Doesnt take callback as 2nd argument, it returns a cusrsor
    db.collection('users').find({name: 'avik'}).toArray((error, users) => {
        console.log('find All: ', users)
    })

    db.collection('users').find({name: 'avik'}).count((error, count) => {
        console.log('Num of users ', count)
    })

})