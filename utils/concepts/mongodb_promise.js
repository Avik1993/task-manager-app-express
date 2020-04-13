const chalk = require('chalk')
const {MongoClient, ObjectID } = require('mongodb')

const connectionURL = process.env.MONGOURL
const databaseName = 'task-app'

// update and delete using promise instead of callbacks as last arguments

MongoClient.connect(connectionURL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
    }, (error, client) => {
        if (error) {
            return console.log(chalk.red('Unable to connect with MongoDB Database'))
        }
        console.log(chalk.green('Connected to MongoDB'))
        const db = client.db(databaseName)

        // UPDATE
        db.collection('users').updateOne({
            name:'avik'
        }, {
            /*  Updating name
            $set: {
                name: 'Mike_updated_Avik'
            }
            */
            /* Updating age  by 1*/
           $inc: {
               age: 1
           }
        }).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })

        db.collection('users').updateMany({
            name: 'avik'
        }, {
            $inc: {
                age: 1
            }
        }).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })


        // DELETE
        db.collection('users').deleteOne({
            name: 'Jen'
        }).then((result) => {
            console.log("DELTED", result)
        }).catch((error) => {
            console.log(error)
        })

        db.collection('users').deleteMany({
            name: 'avik',
            age: 1
        }).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })
})



