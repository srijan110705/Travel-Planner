const jwt=require('jsonwebtoken');
const tripModel=require("../models/trip.model");


async function verifyTrip(req,res,next){
    const token=req.cookies.trip_token;

    let trip = null;
    let decoded;

    if(token){
        try{
            decoded=jwt.verify(token,process.env.JWT_SECRET);
            trip=await tripModel.findById(decoded.id);
        }catch(err){
            console.log("JWT Error:", err.message); // DEBUG LOG
            trip = null;
        }
    }

    if(!trip){
        const tripId = req.body.trip_id || req.query.trip_id || req.params.trip_id;

        if(!tripId || !req.user){
            return res.status(401).json({
                message:"Unauthorised"
            });
        }

        trip = await tripModel.findOne({ trip_id: tripId });
        if(!trip){
            return res.status(401).json({
                message:"Invalid|Trip does not exist"
            });
        }

        const isMember = trip.members.some(memberId => memberId.toString() === req.user._id.toString());
        if(!isMember){
            return res.status(401).json({
                message:"Unauthorised"
            });
        }
    }

    req.trip=trip;
    next();
}

module.exports={verifyTrip};