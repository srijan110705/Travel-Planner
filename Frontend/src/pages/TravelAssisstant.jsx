import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Sparkles } from 'lucide-react';

const TravelAssistant = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setAiResponse(''); // Clear previous response

    try {
      const res = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt: userInput
      }, {
        withCredentials: true // Sends your auth_token cookie
      });

      setAiResponse(res.data.data);
    } catch (error) {
      console.error("AI request failed", error);
      setAiResponse("Sorry, the travel assistant is currently unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Sparkles className="text-cyan-600" /> AI Travel Assistant
      </h2>

      <form onSubmit={handleAskAI} className="flex gap-3 mb-6">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., Give me a 3-day itinerary for Kyoto..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Ask'}
        </button>
      </form>

      {/* Render the AI Response */}
      {aiResponse && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 whitespace-pre-wrap text-slate-700">
          {aiResponse}
        </div>
      )}
    </div>
  );
};

export default TravelAssistant;