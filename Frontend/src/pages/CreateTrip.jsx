import React, { useState } from 'react';
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

export default CreateTrip;
