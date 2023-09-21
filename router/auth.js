const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

const authenticate = require("../middleware/authenticate")
require("../db/conn")
const User = require('../model/userSchema');

router.get('/', (req, res) => {
    res.send(`Hello world from the server rotuer js`);
});


//simple promises
// router.post('/register', (req, res) => {
//     const {name,email,phone,work,password,cpassword}= req.body;

//     if(!name || !email || !phone || !work || !password || !cpassword){
//         return res.status(422).json({ error : "some fields are empty"})
//     }
//     console.log(req.body);
//     // res.json({ message: req.body });
//     // res.send("mera register page");
//     User.findOne({email:email})
//     .then((userExist)=>{
//         if(userExist){
//             return res.status(422).json({ error : "user already exists"})
//         }
//         const user = new User({name,email,phone,work,password,cpassword})
//         user.save().then(()=>{
//             return res.status(201).json({ error : "user registered sucessfully"})
//         }).catch((err)=>(res.status(500).json({error:"user not registered"})
//         ))
//     }).catch((err)=>{
//         console.log(err)
//     })
// });

//using async await
router.post('/register', async(req, res) => {
    const {name,email,phone,work,password,cpassword}= req.body;

    if(!name || !email || !phone || !work || !password || !cpassword){
        return res.status(422).json({ error : "some fields are empty"})
    }
    
    try{
        const userExist = await User.findOne({email:email})
        if(userExist){
            return res.status(422).json({ error : "user already exists"})
        }else if(password != cpassword){
            return res.status(422).json({ error : "password didn't match"})
        }else{
            
                    const user = new User({name,email,phone,work,password,cpassword})
                    await user.save();
                    return res.status(201).json({ error : "user registered sucessfully"})

        }
       
    }catch(err){
        console.log(err);
    }
    
   
    console.log(req.body);
});


//login route
router.post('/login', async(req, res) => {
    const {email,password}= req.body;

    if(!email || !password ){
        return res.status(422).json({ error : "some fields are empty"})
    }
    
    try{
        //getting user details
        const userLogin = await User.findOne({email:email})

        //matching entered password and database password
        if(userLogin){
            const isMatch = await bcrypt.compare(password,userLogin.password)
            const  token = await userLogin.generateAuthToken();
            // console.log(token);

            // creating cookie for automatically logging out in 30 days ,token will be expired 
            res.cookie("jwtoken",token,{
                expires: new Date(Date.now()+ 25892000000),
                httpOnly:true
            })
            if(isMatch){
                return res.status(201).json({ error : "user login sucessfully"})
            }
            else{
                return res.status(422).json({ error : "Invalid Credentials!!"})
            }
        }else{
            return res.status(400).json({ error : "Invalid Credentials!!"})
        }

        // return res.status(201).json({ error : "user registered sucessfully"})
       
    }catch(err){
        console.log(err);
    }
    
   
    console.log(req.body);
});


router.get('/about', authenticate ,(req, res) => {
    // console.log(`Hello my About`);
    res.send(req.rootUser);
});

// get user data for contact us and home page 
router.get('/getdata', authenticate, (req, res) => {
    // console.log(`Hello my About`);
    res.send(req.rootUser);
});


// Logout  ka page 
router.get('/logout', (req, res) => {
    console.log(`Hello my Logout Page`);
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send('User logout');
});
module.exports = router;