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
    },
    dates: { 
        type: String, 
        default: "Dates TBD" },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user' }],
        expenses: [{
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        paid_by: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }]
})

const tripModel=mongoose.model('trip',tripSchema);

module.exports=tripModel;