const User = require("../Models/User");
const router = require("express").Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const checkToken = require("../Middlewares/checkToken");
checkToken
const statusCode = require("../Server/statusCode");

router.get('/', async (req,res)=>{
    return await res.status(200).json({msg:'Default Route'})
});

router.post('/register', async (req,res)=>{
    const { email, username , password , confirmPassword } = req.body;

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

    if(!email || !password){
        return res.status(statusCode['BAD_REQUEST']).json({message:'Please fill all the fields'})
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
        const token = jwt.sign({id:user._id}, secret ,{expiresIn:'1m'});
        return res.status(statusCode['OK']).json({message:"Auth Sucessful",token})
    }
    catch(error){
        return res.status(statusCode['BAD_REQUEST']).json({message:'Error logging in'})
    }


});

//Upgrade User view your private route
router.get('/user/:id',checkToken, async (req,res)=>{
    const { id } = req.params;
    const user = await User.findById(id,{password:0});

    if(!user){
        return res.status(statusCode['BAD_REQUEST']).json({message:'User does not exist'})
    }
 
    return res.status(statusCode['OK']).json({user})


});

module.exports = router;