import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

const JoinTrip = ({ onSuccess }) => {
  const [tripId, setTripId] = useState('');
  const [tripPass, setTripPass] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();
  const { setTripSession } = useTripAccess();

  const handleJoin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post(`${API_URL}/api/trip/login_trip`, { 
        trip_id: tripId, 
        trip_pass: tripPass 
      }, { withCredentials: true });
      
      setTripSession(tripId); 
      
      if (typeof onSuccess === 'function') {
        onSuccess(tripId);
      } else {
        navigate('/dashboard', { state: { selectedTripId: tripId } });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to join trip. Please check your code and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white border border-gray-100 rounded-3xl shadow-lg animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join a Trip</h2>
        <p className="text-gray-500 text-sm mt-2">Enter the trip code and password provided by the organizer.</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-5">
        <div className="space-y-4">
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
              placeholder="Enter the secret key" 
              type="password" 
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !tripId || !tripPass}
          className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Joining...
            </>
          ) : (
            'Join Trip →'
          )}
        </button>
      </form>
    </div>
  );
};

export default JoinTrip;