import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axios.get(`${API_URL}/api/trip/my_trips`, { withCredentials: true });
        setTrips(res.data.trips || []);
      }catch(err){
        console.error(err);
      }
    }
    fetch();
  },[]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">My Trips</h2>
      <ul>
        {trips.map(t => (
          <li key={t.trip_id} className="p-2 border-b">{t.trip_name} — {t.trip_id}</li>
        ))}
      </ul>
    </div>
  )
}

export default MyTrips;
