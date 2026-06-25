// Backend/src/controllers/ai.controller.js
/*const { GoogleGenAI } = require('@google/genai');

// Initialize the SDK using your hidden API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateTravelAdvice(req, res) {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        // Inject a "System Prompt" to force the AI to act like a travel planner
        const systemInstruction = `You are an expert travel planner. 
        Only answer questions related to travel, itineraries, and destinations. 
        Keep your answers concise and formatted with bullet points.
        User request: ${prompt}`;

        // Call the Gemini 2.5 Flash model (fastest and most cost-effective)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemInstruction,
        });

        // Send the AI's text back to the React frontend
        res.status(200).json({ 
            message: "Success",
            data: response.text 
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "Failed to generate AI response" });
    }
}

module.exports = { generateTravelAdvice };*/
const { GoogleGenerativeAI } = require("@google/generative-ai");
const tripModel = require('../models/trip.model');

// ==========================================
// 🎰 THE API KEY ROULETTE HELPER
// ==========================================
function getGenerativeModel() {
    // 1. Grab the 3 keys directly from your .env
    const apiKeys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].filter(Boolean); // This automatically removes any empty or undefined keys
    
    if (apiKeys.length === 0) {
        throw new Error("No API keys found! Add GEMINI_API_KEY_1, 2, and 3 to your .env file.");
    }

    // 2. Pick a random key from the available ones
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    
    // 3. Initialize and return the AI
    const genAI = new GoogleGenerativeAI(randomKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ==========================================
// ROUTE 1: FULL ITINERARY GENERATOR
// ==========================================
async function generateTravelAdvice(req, res) {
    try {
        const { prompt, trip_id } = req.body;

        if (!prompt || !trip_id) {
            return res.status(400).json({ message: "Both prompt and trip_id are required" });
        }

        const model = getGenerativeModel();

        const systemInstruction = `You are an expert travel planner. 
        Generate a logical travel itinerary based on the user's request.
        You MUST respond ONLY with a valid JSON array of objects. Do not include markdown or conversational text.
        Use this exact format:
        [
          { "placeName": "Eiffel Tower", "time": "Morning" },
          { "placeName": "Louvre Museum", "time": "Afternoon" }
        ]
        User request: ${prompt}`;

        const result = await model.generateContent(systemInstruction);
        let text = result.response.text().trim();

        // Bulletproof parsing
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("Gemini failed to return a valid JSON array.");

        const itineraryArray = JSON.parse(match[0]);

        // Save directly to MongoDB
        const updatedTrip = await tripModel.findOneAndUpdate(
            { trip_id: trip_id },
            { $set: { itinerary: itineraryArray } },
            { returnDocument: 'after' } 
        );

        if (!updatedTrip) return res.status(404).json({ message: "Trip not found in database" });

        res.status(200).json({ message: "Success", data: updatedTrip.itinerary });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "Failed to generate or save AI response" });
    }
}

// ==========================================
// ROUTE 2: THE IDEA GENERATOR (NO DB SAVING)
// ==========================================
async function suggestAlternatives(req, res) {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        const model = getGenerativeModel();

        const systemInstruction = `You are a travel assistant helping a user find specific places to add to their itinerary.
        Based on their request, suggest 3 to 5 highly relevant places.
        You MUST respond ONLY with a valid JSON array of objects.
        Use this format:
        [
          { "placeName": "Name of Place", "time": "Suggested Time (e.g. Morning, Evening, Any)" }
        ]
        User request: ${prompt}`;

        const result = await model.generateContent(systemInstruction);
        let text = result.response.text().trim();

        // Bulletproof parsing
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("Gemini failed to return a valid JSON array.");

        const suggestionsArray = JSON.parse(match[0]);

        // Just return it to React! Don't save it to MongoDB.
        res.status(200).json({ message: "Success", suggestions: suggestionsArray });

    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        res.status(500).json({ message: "Failed to fetch suggestions" });
    }
}

// ==========================================
// ROUTE 3: THE ROUTE OPTIMIZER
// ==========================================
async function getOptimalRoute(req, res) {
    try {
        const { trip_id, instructions } = req.body;

        const trip = await tripModel.findOne({ trip_id });
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (!trip.itinerary || trip.itinerary.length === 0) {
            return res.status(400).json({ message: "Itinerary is empty. Generate one first!" });
        }

        const model = getGenerativeModel();
        
        // Failsafe extraction
        const placesToVisit = trip.itinerary.map(item => item.itinerary || item.placeName || item).filter(Boolean).join(', ');

        if (!placesToVisit) {
            return res.status(400).json({ message: "Error: Could not extract place names from the itinerary. Check your database structure." });
        }

        const prompt = `You are a travel routing assistant. 
        Reorder the following destinations into the most logically efficient travel route: ${placesToVisit}. 
        CRITICAL RULES:
        - DO NOT add any new places.
        - DO NOT remove any places.
        - Return ONLY a raw JSON object. Do not include markdown formatting or extra text.
        
        You MUST use this EXACT JSON format:
        {
          "route": ["First Place", "Second Place"],
          "timingNotes": "Write a helpful paragraph explaining the best times to visit these places in this order to avoid crowds or maximize the experience."
        }
        
        Additional instructions: ${instructions || 'None'}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Bulletproof parsing for a JSON Object (using curly braces instead of brackets)
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Gemini failed to return a valid JSON object.");

        const aiResponse = JSON.parse(match[0]);

        res.status(200).json({ 
            message: "Route optimized using Gemini AI", 
            route: aiResponse.route,
            timingNotes: aiResponse.timingNotes
        });
        
    } catch (error) {
        console.error("Routing error:", error);
        res.status(500).json({ message: "Failed to optimize route." });
    }
}

module.exports = { generateTravelAdvice, suggestAlternatives, getOptimalRoute };