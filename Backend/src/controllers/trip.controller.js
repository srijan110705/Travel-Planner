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

async function addDestination(req, res) {
    try {
        const { trip_id, destination_data } = req.body;

        // 1. Securely save the new data to MongoDB
        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { $push: { itinerary: destination_data } },
            { new: true } // Returns the newly updated document
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // 2. Grab the 'io' instance we saved in app.js
        const io = req.app.get('io');

        // 3. Broadcast the fresh database data to EVERYONE in that trip's room
        io.to(trip_id).emit('trip_updated', updatedTrip);

        // 4. Respond to the user who clicked "Save"
        res.status(200).json({ message: "Destination added successfully", trip: updatedTrip });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
async function addExpense(req, res) {
    try {
        const { trip_id, title, amount, paid_by } = req.body;

        // Find the trip and push the new expense into the array
        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { 
                $push: { 
                    expenses: { title, amount: Number(amount), paid_by } 
                } 
            },
            { new: true } // This tells MongoDB to return the updated document
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        res.status(200).json({ 
            message: "Expense added successfully", 
            expenses: updatedTrip.expenses 
        });

    } catch (error) {
        console.error("Expense Error:", error);
        res.status(500).json({ message: "Failed to add expense" });
    }
}
async function getMyTrips(req, res) {
    try {
        // req.user.id comes from your verifyUser middleware!
        console.log("Checking User Token:", req.user);
        const userId = req.user.id; 

        // Find every trip where this user's ID is in the members array
        const myTrips = await tripModel.find({ members: userId });

        res.status(200).json({ trips: myTrips });
    } catch (error) {
        console.error("Fetch Trips Error:", error);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
}

module.exports={access,logout,create,addDestination,addExpense,getMyTrips};