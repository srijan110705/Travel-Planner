// Backend/src/controllers/ai.controller.js
const { GoogleGenAI } = require('@google/genai');

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

module.exports = { generateTravelAdvice };