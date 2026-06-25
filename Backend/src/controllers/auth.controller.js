const userModel=require('../models/user.model');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");

async function register(req,res){
    const {username,email,password}=req.body;

    const isAccountAlreadyExists=await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAccountAlreadyExists){
        return res.status(409).json({
            message:"User with these credentials already exist"
        })
    }

    const hash=await bcrypt.hash(password,10);

    const user=await userModel.create({
        username,
        email,
        password:hash
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);    

    res.cookie('token',token);

    res.status(201).json({
        message:"New user registered successfully",
        user:{
            id:user._id,
            email:user.email
        }
    })
}

async function login(req,res){
    const {username,email,password}=req.body;

    const user=await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!user){
        return res.status(401).json({
            message:"Invalid|User does not exist"
        })
    }

    const isPasswordValid=await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Incorrect Password"
        })
    }

    const token=jwt.sign({
        id:user._id
    },process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
        message:"Login successful",
    })
}

async function logout(req, res) {
    res.clearCookie("token");
    
    res.status(200).json({
        message: "Logout successful"
    });
}

module.exports={login,logout,register};