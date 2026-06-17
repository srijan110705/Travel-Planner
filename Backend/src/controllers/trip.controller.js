const tripModel=require('../models/trip.model');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");

async function create(req,res){
    const {trip_name,trip_id,trip_pass}=req.body;

    const hash=await bcrypt.hash(trip_pass,10);

    const trip=await tripModel.create({
        trip_name,
        trip_id,
        trip_pass:hash
    })

    const token = jwt.sign({ id: trip._id }, process.env.JWT_SECRET);

    res.cookie('trip_token',token);

    res.status(201).json({
        message:"New trip created successfully",
        trip:{
            trip_name,
            trip_id
        }
    })
}

async function access(req,res){
    const {trip_id,trip_pass}=req.body;

    const trip=await tripModel.findOne({trip_id});

    if(!trip){
        return res.status(401).json({
            message:"Invalid|Trip does not exist"
        })
    }

    const isPasswordValid=await bcrypt.compare(trip_pass,trip.trip_pass);

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Incorrect Password"
        })
    }

    const token=jwt.sign({
        id:trip._id
    },process.env.JWT_SECRET);

    res.cookie("trip_token", token);

    res.status(200).json({
        message:"Login successful",
    })
}

async function logout(req, res) {
    res.clearCookie("trip_token");
    
    res.status(200).json({
        message: "Logout successful"
    });
}

module.exports={access,logout,create};