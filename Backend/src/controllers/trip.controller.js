const tripModel = require('../models/trip.model');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function sanitizeExpenses(trip) {
    if (!trip || !Array.isArray(trip.expenses) || trip.expenses.length === 0) {
        return trip;
    }

    const validExpenses = trip.expenses.filter(expense => {
        return expense && typeof expense.paid_by === 'string' && expense.paid_by.trim().length > 0;
    });

    if (validExpenses.length !== trip.expenses.length) {
        trip.expenses = validExpenses;
        await trip.save();
    }

    return trip;
}

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

        res.status(200).json({ message: "Destination added successfully", trip: updatedTrip });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function removeDestination(req, res) {
    try {
        const { trip_id, destination_index } = req.body;

        const trip = await tripModel.findOne({ trip_id });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Add failsafe for undefined itinerary
        if (!trip.itinerary || typeof destination_index !== 'number' || destination_index < 0 || destination_index >= trip.itinerary.length) {
            return res.status(400).json({ message: 'Invalid destination index' });
        }

        trip.itinerary.splice(destination_index, 1);
        
        // Use findOneAndUpdate to bypass full document validation
        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id },
            { $set: { itinerary: trip.itinerary } },
            { returnDocument: 'after' }
        );

        res.status(200).json({ message: 'Destination removed successfully', trip: updatedTrip });
    } catch (error) {
        console.error('Remove Destination Error:', error);
        res.status(500).json({ message: 'Failed to remove destination' });
    }
}

async function addExpense(req, res) {
    try {
        const { trip_id, title, amount } = req.body;
        const paid_by = req.user.username;

        const trip = await tripModel.findOne({ trip_id });
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        await sanitizeExpenses(trip);

        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { 
                $push: { 
                    expenses: { title, amount: Number(amount), paid_by } 
                } 
            },
            { returnDocument: 'after' } 
        );

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

        const myTrips = await tripModel
            .find({ members: userId })
            .populate({ path: 'members', select: 'username email' });

        res.status(200).json({ trips: myTrips });
    } catch (error) {
        console.error("Fetch Trips Error:", error);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
}

async function getTrip(req, res) {
    try {
        const { trip_id } = req.params;

        const trip = await tripModel.findOne({ trip_id }).populate({ path: 'members', select: 'username email' });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        await sanitizeExpenses(trip);

        res.status(200).json({ trip });
    } catch (error) {
        console.error('Fetch Trip Error:', error);
        res.status(500).json({ message: 'Failed to fetch trip' });
    }
}

async function getOptimalRoute(req, res) {
    try {
        const { trip_id } = req.body;
        const trip = await tripModel.findOne({ trip_id });
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (!trip.itinerary || trip.itinerary.length === 0) {
            return res.status(400).json({ message: "Itinerary is empty" });
        }

        const apiKeys = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3
        ].filter(Boolean); // Removes undefined/empty keys

        if (apiKeys.length === 0) {
            return res.status(500).json({ message: "No Gemini API keys found in the environment." });
        }

        let text;
        let success = false;
        let lastError = null;

        // Loop through the keys sequentially until one works
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const genAI = new GoogleGenerativeAI(apiKeys[i]);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `You are a travel routing assistant. Reorder the following destinations into the most logically efficient travel route: ${JSON.stringify(trip.itinerary)}. Return ONLY a raw JSON array of strings representing the ordered route. Do not include markdown formatting, backticks, or any conversational text.`;
                
                const result = await model.generateContent(prompt);
                text = result.response.text().trim();
                success = true;
                break; // Stop looping if the request succeeds
            } catch (apiError) {
                lastError = apiError;
                console.warn(`Key ${i + 1} failed (Rate Limit / Error). Trying next key...`);
                continue; 
            }
        }

        if (!success) {
            throw lastError; // If all 3 keys fail, pass the error down to the handler below
        }

        // Robust cleanup: remove all markdown ticks and "json" keywords anywhere in the text
        text = text.replace(/```(json)?/gi, '').trim();

        let optimizedRoute;
        try {
            optimizedRoute = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON Parse Error. Gemini returned:", text);
            return res.status(500).json({ 
                message: "AI returned an invalid format.", 
                errorDetails: text 
            });
        }

        res.status(200).json({ 
            message: "Route optimized using Gemini AI", 
            route: optimizedRoute 
        });
    } catch (error) {
        // More robust 429 check
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            console.warn("Gemini Rate Limit Hit. Waiting for quota to reset...");
            return res.status(429).json({ 
                message: "AI service is busy (Rate limit exceeded). Please wait 1 minute and try again." 
            });
        }

        // Handle 503 High Demand gracefully
        if (error.status === 503 || (error.message && error.message.includes('503'))) {
            return res.status(503).json({ 
                message: "AI service is currently experiencing high demand. Please try again in a few moments." 
            });
        }

        // Only log actual unexpected errors
        console.error("Routing error:", error);
        
        res.status(500).json({ 
            message: "Failed to optimize route.", 
            errorDetails: error.message 
        });
    }
}

module.exports = { access, logout, create, addDestination, removeDestination, addExpense, getMyTrips, getTrip, getOptimalRoute };