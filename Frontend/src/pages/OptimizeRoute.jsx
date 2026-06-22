import React, { useState } from 'react';
import axios from 'axios';

const OptimizeRoute = () => {
  const [tripId, setTripId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [route, setRoute] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleOptimize = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/trip/optimize_route`, { trip_id: tripId, instructions }, { withCredentials: true });
      setRoute(res.data.route);
    } catch (err) {
      console.error(err);
      alert('Failed to optimize route');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Optimize Route</h2>
      <form onSubmit={handleOptimize} className="space-y-4">
        <input value={tripId} onChange={(e)=>setTripId(e.target.value)} placeholder="Trip code" className="w-full p-2 border rounded" />
        <textarea value={instructions} onChange={(e)=>setInstructions(e.target.value)} placeholder="Instructions (optional)" className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Optimize</button>
      </form>
      {route && (
        <ol className="mt-4 list-decimal pl-6">
          {route.map((r,i)=> <li key={i}>{r}</li>)}
        </ol>
      )}
    </div>
  )
}

export default OptimizeRoute;
