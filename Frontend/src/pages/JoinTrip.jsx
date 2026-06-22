import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

const JoinTrip = () => {
  const [tripId, setTripId] = useState('');
  const [tripPass, setTripPass] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();
  const { setTripSession } = useTripAccess();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/trip/login_trip`, { trip_id: tripId, trip_pass: tripPass }, { withCredentials: true });
      setTripSession(tripId); // Store trip session
      navigate('/dashboard', { state: { selectedTripId: tripId } });
    } catch (err) {
      console.error(err);
      alert('Failed to join trip');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Join Trip</h2>
      <form onSubmit={handleJoin} className="space-y-4">
        <input value={tripId} onChange={(e)=>setTripId(e.target.value)} placeholder="Trip code" className="w-full p-2 border rounded" />
        <input value={tripPass} onChange={(e)=>setTripPass(e.target.value)} placeholder="Trip password" type="password" className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Join</button>
      </form>
    </div>
  );
};

export default JoinTrip;
