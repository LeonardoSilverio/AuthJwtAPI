//.env
require('dotenv').config();

//Express config
const express = require('express')
const app = express()
const port = process.env.API_PORT || 3000

//Midleware Json
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Auth Routes
const routerAuth = require('../Routes/auth')
app.use('/auth', routerAuth)


//Mongodb variables
const mongoose = require("mongoose");
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@clusterauthjwt.nit3b.mongodb.net/AuthJwt?retryWrites=true&w=majority`

//Mongoose connection
mongoose.connect(uri,()=>{
    try {
        console.log('MongoDb Connected')
        app.listen(port, () => console.log(`Server ON: http://localhost:${port}`))
    } catch (error) {
        console.log(error)
    }
})

