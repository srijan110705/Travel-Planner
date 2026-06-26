import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Finances from '../components/Finances'; 
import Itinerary from '../components/Itinerary'; 
import CreateTrip from './CreateTrip';
import JoinTrip from './JoinTrip';
import { useTripAccess } from '../hooks/useTripAccess';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTripSession } = useTripAccess();
  
  const [myTrips, setMyTrips] = useState([]); 
  const [selectedTrip, setSelectedTrip] = useState(null); 
  const [activeTab, setActiveTab] = useState('itinerary'); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [activePanel, setActivePanel] = useState('trips');

  // FIXED: Added the dynamic API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchTrips = async () => {
    try {
      // FIXED: Used API_URL
      const response = await axios.get(`${API_URL}/api/trip/my_trips`, { withCredentials: true });
      const trips = response.data.trips || [];
      setMyTrips(trips);
      return trips;
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
      return [];
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const loadTrips = async () => {
      const trips = await fetchTrips();
      const selId = location?.state?.selectedTripId;
      if (selId) {
        const found = trips.find(t => t.trip_id === selId);
        if (found) {
          setSelectedTrip(found);
          setActiveTab('itinerary');
          setActivePanel('trips');
        }
      }
    };
    loadTrips();
  }, [location]);

  const handleLogout = async () => {
    try {
      // FIXED: Used API_URL
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } finally {
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-black text-indigo-600 mb-8 flex items-center gap-2">✈️ TripPlanner</h1>
          <nav className="space-y-2">
            <button onClick={() => { setSelectedTrip(null); setActivePanel('trips'); }} className="w-full text-left px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold transition-colors">My Trips</button>
            <button onClick={() => { setSelectedTrip(null); setActivePanel('create'); }} className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors">Create Trip</button>
            <button onClick={() => { setSelectedTrip(null); setActivePanel('join'); }} className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors">Join with Credentials</button>
          </nav>
        </div>
        <button onClick={handleLogout} className="text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors">Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 pt-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {selectedTrip ? selectedTrip.trip_name : `Welcome back, ${currentUser?.username || 'Traveler'}`}
          </h2>
          <div className="h-10 w-10 bg-linear-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'T'}
          </div>
        </header>

        {/* TRIP GRID */}
        {!selectedTrip && activePanel === 'trips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {myTrips.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                <p className="text-gray-500 font-medium">No trips found. Create a new trip to get started!</p>
              </div>
            ) : (
              myTrips.map((trip) => (
                <div key={trip.trip_id} onClick={() => { setTripSession(trip.trip_id); setSelectedTrip(trip); }} className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{trip.trip_name}</h3>
                  <p className="text-sm text-gray-500 mt-2 font-medium">{trip.dates}</p>
                </div>
              ))
            )}
          </div>
        )}

        {!selectedTrip && activePanel === 'create' && (
          <div className="max-w-3xl mx-auto">
            <CreateTrip onSuccess={async (createdTripId, tripData) => {
              setTripSession(createdTripId);
              const trips = tripData ? [tripData, ...myTrips] : await fetchTrips();
              const foundTrip = tripData || trips.find((trip) => trip.trip_id === createdTripId);
              if (foundTrip) {
                setSelectedTrip(foundTrip);
                setActivePanel('trips');
              }
            }} />
          </div>
        )}

        {!selectedTrip && activePanel === 'join' && (
          <div className="max-w-3xl mx-auto">
            <JoinTrip onSuccess={async (joinedTripId) => {
              setTripSession(joinedTripId);
              const trips = await fetchTrips();
              const found = trips.find((trip) => trip.trip_id === joinedTripId);
              if (found) {
                setSelectedTrip(found);
                setActivePanel('trips');
              }
            }} />
          </div>
        )}

        {/* ACTIVE TRIP WORKSPACE */}
        {selectedTrip && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setSelectedTrip(null)} className="text-sm font-bold text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-2 transition-colors">← Back to all trips</button>

            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {['itinerary', 'finances'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-1 capitalize font-bold text-sm transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300'}`}>{tab}</button>
              ))}
            </div>

            <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm min-h-125">
              
              {activeTab === 'itinerary' && (
                <Itinerary selectedTrip={selectedTrip} setSelectedTrip={setSelectedTrip} />
              )}

              {activeTab === 'finances' && (
                <div className="animate-in fade-in duration-500">
                  <Finances tripId={selectedTrip.trip_id} initialExpenses={selectedTrip.expenses || []} members={selectedTrip.members?.map(m => m.username || m._id) || []} />
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;