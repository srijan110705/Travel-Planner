import React, { useState } from 'react';
import axios from 'axios';

const AddDestination = () => {
  const [tripId, setTripId] = useState('');
  const [destination, setDestination] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/trip/add_destination`, { trip_id: tripId, destination_data: destination }, { withCredentials: true });
      alert('Destination added');
    } catch (err) {
      console.error(err);
      alert('Failed to add destination');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Add Destination</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        <input value={tripId} onChange={(e)=>setTripId(e.target.value)} placeholder="Trip code" className="w-full p-2 border rounded" />
        <input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination" className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
      </form>
    </div>
  );
};

export default AddDestination;
