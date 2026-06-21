const tripModel = require('../models/trip.model');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function create(req, res) {
    const { trip_name, trip_id, trip_pass } = req.body;

    const hash = await bcrypt.hash(trip_pass, 10);

    const trip = await tripModel.create({
        trip_name,
        trip_id,
        trip_pass: hash,
        members: [req.user._id] // FIX: Added the creator to the members array here
    });

    const token = jwt.sign({ id: trip._id }, process.env.JWT_SECRET);

    res.cookie('trip_token', token);

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

    const token = jwt.sign({
        id: trip._id
    }, process.env.JWT_SECRET);

    res.cookie("trip_token", token);

    res.status(200).json({
        message: "Login successful",
    });
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

        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { $push: { itinerary: destination_data } },
            { new: true } 
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const io = req.app.get('io');
        io.to(trip_id).emit('trip_updated', updatedTrip);

        res.status(200).json({ message: "Destination added successfully", trip: updatedTrip });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
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
            { new: true } 
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
        const userId = req.user.id; 

        const myTrips = await tripModel.find({ members: userId });

        res.status(200).json({ trips: myTrips });
    } catch (error) {
        console.error("Fetch Trips Error:", error);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
}

async function getDebtSettlements(req, res) {
    try {
        const { trip_id } = req.body;
        const trip = await tripModel.findOne({ trip_id });
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        let total = 0;
        const paid = {};
        
        // Calculate total and how much each person paid
        trip.expenses.forEach(e => {
            total += e.amount;
            paid[e.paid_by] = (paid[e.paid_by] || 0) + e.amount;
        });

        const participants = Object.keys(paid);
        const split = participants.length ? total / participants.length : 0;
        
        // Separate into who owes money (debtors) and who gets money back (creditors)
        let creditors = [], debtors = [];
        participants.forEach(p => {
            const diff = paid[p] - split;
            if (diff > 0.01) creditors.push({ person: p, amount: diff });
            else if (diff < -0.01) debtors.push({ person: p, amount: Math.abs(diff) });
        });

        // Calculate who pays whom
        const settlements = [];
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            let amount = Math.min(debtors[i].amount, creditors[j].amount);
            settlements.push({ 
                from: debtors[i].person, 
                to: creditors[j].person, 
                amount: amount.toFixed(2) 
            });
            
            debtors[i].amount -= amount;
            creditors[j].amount -= amount;
            
            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }

        res.status(200).json({ total, split, settlements });
    } catch (error) {
        console.error("Settlement error:", error);
        res.status(500).json({ message: "Failed to calculate settlements" });
    }
}

async function getOptimalRoute(req, res) {
    try {
        const { trip_id,instructions } = req.body;
        const trip = await tripModel.findOne({ trip_id });
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (!trip.itinerary || trip.itinerary.length === 0) {
            return res.status(400).json({ message: "Itinerary is empty" });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prompt Gemini to return a strict JSON array
        const prompt = `You are a travel routing assistant. Reorder the following destinations into the most logically efficient travel route: ${trip.itinerary.join(', ')}. Return ONLY a raw JSON array of strings representing the ordered route. Do not include markdown formatting, backticks, or any conversational text.${instructions}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Failsafe to clean up markdown if Gemini still includes it
        if (text.startsWith('```')) {
            text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        const optimizedRoute = JSON.parse(text);

        res.status(200).json({ 
            message: "Route optimized using Gemini AI", 
            route: optimizedRoute 
        });
    } catch (error) {
        console.error("Routing error:", error);
        res.status(500).json({ message: "Failed to optimize route. Make sure your GEMINI_API_KEY is correct." });
    }
}

module.exports = { access, logout, create, addDestination, addExpense, getMyTrips, getDebtSettlements, getOptimalRoute };