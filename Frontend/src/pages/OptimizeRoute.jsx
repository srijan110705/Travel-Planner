import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const OptimizeRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✨ Automatically grabs the ID if they clicked here from the Dashboard
  const [tripId, setTripId] = useState(location.state?.selectedTripId || '');
  const [instructions, setInstructions] = useState('');
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleOptimize = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/optimize_route`, { trip_id: tripId, instructions }, { withCredentials: true });
      setRoute(res.data.route);
    } catch (err) {
      console.error(err);
      alert('Failed to optimize route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <button onClick={() => navigate(-1)} className="text-sm font-bold text-gray-500 hover:text-indigo-600 mb-4">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Optimize Route</h2>
      <form onSubmit={handleOptimize} className="space-y-4">
        <input value={tripId} onChange={(e)=>setTripId(e.target.value)} placeholder="Trip code" className="w-full p-2 border rounded" required />
        <textarea value={instructions} onChange={(e)=>setInstructions(e.target.value)} placeholder="Instructions (optional) e.g., 'Make it walkable'" className="w-full p-2 border rounded" rows="3" />
        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded disabled:opacity-50">
          {isLoading ? 'Optimizing with AI...' : 'Optimize'}
        </button>
      </form>
      {route && (
        <div className="mt-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-4">AI Recommended Route:</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-800 font-medium">
            {route.map((r,i)=> <li key={i}>{r}</li>)}
          </ol>
        </div>
      )}
    </div>
  )
}

export default OptimizeRoute;