const tripModel = require('../models/trip.model');
const bcrypt = require("bcryptjs");

async function create(req, res) {
    const { trip_name, trip_id, trip_pass } = req.body;

    const hash = await bcrypt.hash(trip_pass, 10);

    await tripModel.create({
        trip_name,
        trip_id,
        trip_pass: hash,
        members: [req.user._id] 
    });

    res.status(201).json({
        message: "New trip created successfully",
        trip: {
            trip_name,
            trip_id
        }
    });
}

async function access(req, res) {
    const { trip_id, trip_pass } = req.body;

    const trip = await tripModel.findOne({ trip_id });

    if (!trip) {
        return res.status(401).json({
            message: "Invalid|Trip does not exist"
        });
    }

    const isPasswordValid = await bcrypt.compare(trip_pass, trip.trip_pass);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Incorrect Password"
        });
    }

    // Add user to members array (MongoDB $addToSet prevents duplicates)
    await tripModel.findByIdAndUpdate(trip._id, {
        $addToSet: { members: req.user._id }
    });

    res.status(200).json({
        message: "Login successful",
    });
}

async function addDestination(req, res) {
    try {
        const { trip_id, destination_data } = req.body;

        // If the user typed a string manually, format it like an AI object!
        let newDestination = destination_data;
        if (typeof destination_data === 'string') {
            newDestination = { placeName: destination_data, time: "Custom" };
        }

        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { $push: { itinerary: newDestination } },
            { returnDocument: 'after' } 
        ).populate('members', 'username email');

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const io = req.app.get('io');
        if (io) io.to(trip_id).emit('trip_updated', updatedTrip);

        res.status(200).json({ message: "Destination added successfully", trip: updatedTrip });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function removeDestination(req, res) {
    try {
        const { trip_id, destination_index } = req.body;

        if (!trip_id || destination_index === undefined) {
            return res.status(400).json({ message: "Trip ID and destination index are required" });
        }

        let trip = await tripModel.findOne({ trip_id: trip_id }).populate('members', 'username email');
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Splice removes the exact item from the array
        trip.itinerary.splice(destination_index, 1);
        await trip.save();
        await trip.populate('members', 'username email');

        const io = req.app.get('io');
        if (io) io.to(trip_id).emit('trip_updated', trip);

        res.status(200).json({ message: "Destination removed successfully", trip: trip });

    } catch (error) {
        console.error("Error removing destination:", error);
        res.status(500).json({ message: "Failed to remove destination" });
    }
}

async function addExpense(req, res) {
    try {
        const { trip_id, title, amount } = req.body;

        const paid_by = req.user.username;

        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { 
                $push: { 
                    expenses: { title, amount: Number(amount), paid_by } 
                } 
            },
            { returnDocument: 'after' } 
        ).populate('members', 'username email');

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
        const userId = req.user.id; 

        const myTrips = await tripModel.find({ members: userId }).populate('members', 'username email');

        res.status(200).json({ trips: myTrips });
    } catch (error) {
        console.error("Fetch Trips Error:", error);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
}

module.exports = { access, create, addDestination, removeDestination, addExpense, getMyTrips };