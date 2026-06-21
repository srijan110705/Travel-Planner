import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Finances from '../components/Finances'; // Make sure this path is correct!
 const Dashboard=()=> {
  const navigate = useNavigate();
  
  // State Management
  const [myTrips, setMyTrips] = useState([]); // Holds data from GET /api/trip/my_trips
  const [selectedTrip, setSelectedTrip] = useState(null); // Which trip the user clicked
  const [activeTab, setActiveTab] = useState('itinerary'); // Tabs inside a specific trip

  // 1. Fetch Trips when the Dashboard loads
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // API ROUTE: Get all trips for this user
        const response = await axios.get('http://localhost:3000/api/trip/my_trips', { withCredentials: true });
        setMyTrips(response.data.trips);
      } catch (error) {
        console.error("Failed to fetch trips", error);
        // If unauthorized, send them back to login
        if (error.response?.status === 401) navigate('/login');
      }
    };
    
    // Fetching live data from backend!
    fetchTrips(); 
    
  }, [navigate]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-black text-indigo-600 mb-8 flex items-center gap-2">
            ✈️ TripPlanner
          </h1>
          <nav className="space-y-2">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="w-full text-left px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold transition-colors"
            >
              My Trips
            </button>
            <button 
              onClick={() => navigate('/travel_assistant')}
              className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors"
            >
              + New AI Trip
            </button>
            <button className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors">
              Join with Code
            </button>
          </nav>
        </div>
        
        <button onClick={handleLogout} className="text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors">
          Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 pt-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {selectedTrip ? selectedTrip.trip_name : "Welcome back, Kruthika"}
          </h2>
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
            K
          </div>
        </header>

        {/* CONDITION 1: SHOW THE GRID OF TRIPS */}
        {!selectedTrip && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {myTrips.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                <p className="text-gray-500 font-medium">No trips found. Create a new trip to get started!</p>
              </div>
            ) : (
              myTrips.map((trip) => (
                <div 
                  key={trip.trip_id} 
                  onClick={() => setSelectedTrip(trip)}
                  className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{trip.trip_name}</h3>
                  <p className="text-sm text-gray-500 mt-2 font-medium">{trip.dates}</p>
                  <div className="mt-6 text-sm text-indigo-600 font-bold flex items-center gap-1">
                    Open Workspace <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONDITION 2: SHOW THE ACTIVE TRIP WORKSPACE */}
        {selectedTrip && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="text-sm font-bold text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-2 transition-colors"
            >
              ← Back to all trips
            </button>

            {/* Trip Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {['itinerary', 'finances', 'route'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 capitalize font-bold text-sm transition-colors ${
                    activeTab === tab 
                      ? 'border-b-2 border-indigo-600 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm min-h-[500px]">
              
              {activeTab === 'itinerary' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Live Itinerary</h3>
                  <p className="text-gray-500 text-sm mb-6">Real-time collaboration lobby.</p>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gray-50">
                    <p className="text-gray-400 font-medium">The live sockets module will render here.</p>
                  </div>
                </div>
              )}

              {activeTab === 'finances' && (
                <div className="animate-in fade-in duration-500">
                  {/* --- THE FINANCES COMPONENT HAS BEEN PLUGGED IN HERE --- */}
                  <Finances 
                    tripId={selectedTrip.trip_id} 
                    initialExpenses={selectedTrip.expenses || []} 
                    members={['kruthika', 'friend1', 'friend2']} 
                  />
                </div>
              )}

              {activeTab === 'route' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Smart Map</h3>
                  <p className="text-gray-500 text-sm mb-6">AI-powered route optimization.</p>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gray-50">
                    <p className="text-gray-400 font-medium">Google Maps & Gemini AI module will render here.</p>
                  </div>
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