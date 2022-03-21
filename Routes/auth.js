const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const checkToken = require("../middlewares/checkToken");
checkToken
const statusCode = require("../server/statusCode");
const path = require("path");


router.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, '../Templates/loginPage.html'));
});

router.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname, '../Templates/registerPage.html'));
});

router.post('/register', async (req,res)=>{
    const { email, username , password , confirmPassword} = req.body;

    if(!email || !username || !password || !confirmPassword){
        return res.status(statusCode['BAD_REQUEST']).json({message:'Please fill all the fields'})
    }

    if(password !== confirmPassword){
        return res.status(statusCode['BAD_REQUEST']).json({message:'Passwords do not match'})
    }


    const user = await User.findOne({email});

    if(user){
        return res.status(statusCode['BAD_REQUEST']).json({message:'User already exists'})
    }

    //Crypto password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        email,
        username,
        password : hashedPassword
    });

    try {
        await newUser.save();
        return res.status(statusCode['CREATED']).json({message:'User created successfully'})
    } catch (error) {
        return res.status(statusCode['BAD_REQUEST']).json({message:'Error creating user'})
    }
});

router.post('/login', async (req,res)=>{
    const { email, password } = req.body;

    if (!email) {
        return res.status(statusCode['BAD_REQUEST']).json({message:'Please fill Email'})
    }

    if (!password) {
        return res.status(statusCode['BAD_REQUEST']).json({message:'Please fill Password'})
    }

    const user = await User.findOne({email});

    if(!user){
        return res.status(statusCode['BAD_REQUEST']).json({message:'User does not exist'})
    }

    const checkedPassword = await bcrypt.compare(password, user.password);

    if (!checkedPassword) {
        return res.status(statusCode['BAD_REQUEST']).json({message:'Incorrect password'})
    }

    try{
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign({id:user._id}, secret ,{expiresIn:'1d'});
        return res.status(statusCode['OK']).json({message:"Auth Sucessful",token})
    }
    catch(error){
        return res.status(statusCode['BAD_REQUEST']).json({message:'Error logging in'})
    }


});

//Private route
router.get('/profile/:id',checkToken, async (req,res)=>{
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    
    //Payload ID token validation with ID User
    const informationToken = atob(token.split('.')[1]);
    const idPayload = JSON.parse(informationToken).id;


    // const user = await User.findById(id,{password:0});
    const user = await User.findById(id);

    if(!user){
        return res.status(statusCode['BAD_REQUEST']).json({message:'User does not exist'})
    };

    if (idPayload == id) {
        return res.status(statusCode['OK']).json({user:user,message:'You have all information about your profile.'})
    }
    else{
        return res.status(statusCode['OK']).json({user:user.username,email:user.email,message:'This is not your profile, information will be limited.'})
    }

});

module.exports = router;