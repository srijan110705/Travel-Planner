import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

const CreateTrip = ({ onSuccess }) => {
  const [tripName, setTripName] = useState('');
  const [tripId, setTripId] = useState('');
  const [tripPass, setTripPass] = useState('');
  
  // State for AI logic
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();
  const { setTripSession } = useTripAccess();

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/trip/create_trip`, {
        trip_name: tripName,
        trip_id: tripId,
        trip_pass: tripPass,
      }, { withCredentials: true });

      const createdId = res.data?.trip?.trip_id || tripId;
      setTripSession(createdId);

      if (prompt.trim()) {
        await axios.post(`${API_URL}/api/ai/generate`, {
          prompt: prompt,
          trip_id: createdId,
        }, { withCredentials: true });
      }

      if (typeof onSuccess === 'function') {
        onSuccess(createdId, res.data?.trip);
      } else {
        navigate('/dashboard', { state: { selectedTripId: createdId } });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white border border-gray-100 rounded-3xl shadow-lg animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create a New Trip</h2>
        <p className="text-gray-500 text-sm mt-2">Set up your travel space and let AI build your perfect itinerary.</p>
      </div>
      
      <form onSubmit={handleCreate} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Trip Name</label>
            <input 
              required
              value={tripName} 
              onChange={(e) => setTripName(e.target.value)} 
              placeholder="e.g. Summer in Paris" 
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Trip Code</label>
              <input 
                required
                value={tripId} 
                onChange={(e) => setTripId(e.target.value)} 
                placeholder="e.g. PARIS2026" 
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                required
                value={tripPass} 
                onChange={(e) => setTripPass(e.target.value)} 
                placeholder="Secret key" 
                type="password" 
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" 
              />
            </div>
          </div>
        </div>

        {/* AI Section */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
            ✨ AI Auto-Generate <span className="text-xs font-normal text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-md">Optional</span>
          </label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="e.g. 3 days in Paris focusing on food and art museums..." 
            rows="3"
            className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Trip...
            </>
          ) : (
            'Create Trip →'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;