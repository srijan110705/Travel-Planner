const mongoose=require('mongoose');

const tripSchema=new mongoose.Schema({
    trip_name:{
        type:String,
        required:true
    },
    trip_id:{
        type:String,
        required:true,
        unique:true
    },
    trip_pass:{
        type:String,
        required:true
    }
})

const tripModel=mongoose.model('trip',tripSchema);

module.exports=tripModel;