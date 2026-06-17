const jwt=require('jsonwebtoken');
const tripModel=require("../models/trip.model");


async function verifyTrip(req,res,next){
    const token=req.cookies.trip_token;

    if(!token){
        return res.status(401).json({
            message:"Unauthorised"
        })
    }

    let decoded;

    try{
        decoded=jwt.verify(token,process.env.JWT_SECRET);
        const trip=await tripModel.findById(decoded.id)
        if(!trip){
            return res.status(401).json({
                message:"Invalid|Trip does not exist"
            })
        }
        
        req.trip=trip;

        next();
    }catch(err){
        console.log("JWT Error:", err.message); // DEBUG LOG
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports={verifyTrip};