const mongoose=require("mongoose");

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI, {family: 4})
        console.log("Database connected successfully");
    }
    catch(error){
        console.error("Database connection error:",error);
    }
}

module.exports=connectDB;