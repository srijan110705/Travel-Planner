const jwt=require('jsonwebtoken');
const userModel=require("../models/user.model");


async function verifyUser(req,res,next){
    const token=req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unauthorised"
        })
    }

    let decoded;

    try{
        decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded.id)
        if(!user){
            return res.status(401).json({
                message:"Invalid|User does not exist"
            })
        }
        
        req.user=user;

        next();
    }catch(err){
        console.log("JWT Error:", err.message); // DEBUG LOG
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports={verifyUser};