const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOURL+'/task-manager-api', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})