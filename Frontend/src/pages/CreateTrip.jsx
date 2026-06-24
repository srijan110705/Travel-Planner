/*import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

const CreateTrip = () => {
  const [tripName, setTripName] = useState('');
  const [tripId, setTripId] = useState('');
  const [tripPass, setTripPass] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();
  const { setTripSession } = useTripAccess();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/trip/create_trip`, { trip_name: tripName, trip_id: tripId, trip_pass: tripPass }, { withCredentials: true });
      const createdId = res.data?.trip?.trip_id || tripId;
      setTripSession(createdId); // Store trip session
      navigate('/dashboard', { state: { selectedTripId: createdId } });
    } catch (err) {
      console.error(err);
      alert('Failed to create trip');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Create Trip</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <input value={tripName} onChange={(e)=>setTripName(e.target.value)} placeholder="Trip name" className="w-full p-2 border rounded" />
        <input value={tripId} onChange={(e)=>setTripId(e.target.value)} placeholder="Trip code" className="w-full p-2 border rounded" />
        <input value={tripPass} onChange={(e)=>setTripPass(e.target.value)} placeholder="Trip password" type="password" className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
      </form>
    </div>
  );
};

export default CreateTrip;*/
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

const CreateTrip = () => {
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
      // Step 1: Create the basic trip
      const res = await axios.post(`${API_URL}/api/trip/create_trip`, { 
        trip_name: tripName, 
        trip_id: tripId, 
        trip_pass: tripPass 
      }, { withCredentials: true });
      
      const createdId = res.data?.trip?.trip_id || tripId;
      setTripSession(createdId);

      // Step 2: Generate AI itinerary if the user typed a prompt
      if (prompt.trim()) {
        await axios.post(`${API_URL}/api/ai/generate`, { 
          prompt: prompt, 
          trip_id: createdId 
        }, { withCredentials: true });
      }

      // Step 3: Redirect
      navigate('/dashboard', { state: { selectedTripId: createdId } });
      
    } catch (err) {
      console.error(err);
      alert('Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Create Trip</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <input 
          required
          value={tripName} 
          onChange={(e)=>setTripName(e.target.value)} 
          placeholder="Trip name" 
          className="w-full p-2 border rounded" 
        />
        <input 
          required
          value={tripId} 
          onChange={(e)=>setTripId(e.target.value)} 
          placeholder="Trip code" 
          className="w-full p-2 border rounded" 
        />
        <input 
          required
          value={tripPass} 
          onChange={(e)=>setTripPass(e.target.value)} 
          placeholder="Trip password" 
          type="password" 
          className="w-full p-2 border rounded" 
        />
        
        {/* Simple Textarea for AI Prompt */}
        <textarea 
          value={prompt} 
          onChange={(e)=>setPrompt(e.target.value)} 
          placeholder="AI Prompt (Optional): e.g. 3 days in Paris focusing on food" 
          rows="3"
          className="w-full p-2 border rounded" 
        />

        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-[#5b21b6] text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
