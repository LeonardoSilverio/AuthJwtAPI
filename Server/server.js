//.env
require('dotenv').config();


//Express config
const express = require('express')
const app = express()
const port = process.env.API_PORT || 3000

//Midlewares Json and Static files
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

//Cors
const cors = require('cors');
app.use(cors());

//Default Route
app.get('/', (req, res) => {
    res.send('Hello ! Use /auth/login or /auth/register for testing!')
}); 

//Auth Routes
const routerAuth = require('../routes/auth')
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
        app.listen(port ,'127.0.0.1', () => console.log(`Server ON: http://localhost:${port}`))
    } catch (error) {
        console.log(error)
    }
})

