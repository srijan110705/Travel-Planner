import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
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
    
    // NOTE: Commented out for now so you can see the UI without the backend crashing it!
    // fetchTrips(); 
    
    // DUMMY DATA (Remove this once backend is connected)
    setMyTrips([
      { trip_id: 'paris-2026', trip_name: 'Paris Vacation', dates: 'Dec 05 - Dec 10', itinerary: [], expenses: [] }
    ]);
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
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-600 mb-8">✈️ TripPlanner</h1>
          <nav className="space-y-2">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium"
            >
              My Trips
            </button>
            <button 
              onClick={() => navigate('/travel_assistant')}
              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
            >
              + New AI Trip
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">
              Join with Code
            </button>
          </nav>
        </div>
        
        <button onClick={handleLogout} className="text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium">
          Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {selectedTrip ? selectedTrip.trip_name : "Welcome back, Kruthika"}
          </h2>
          <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
            K
          </div>
        </header>

        {/* CONDITION 1: SHOW THE GRID OF TRIPS */}
        {!selectedTrip && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myTrips.map((trip) => (
              <div 
                key={trip.trip_id} 
                onClick={() => setSelectedTrip(trip)}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-indigo-400 transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900">{trip.trip_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{trip.dates}</p>
                <div className="mt-4 text-sm text-indigo-600 font-medium">Open Workspace →</div>
              </div>
            ))}
          </div>
        )}

        {/* CONDITION 2: SHOW THE ACTIVE TRIP WORKSPACE */}
        {selectedTrip && (
          <div>
            <button 
              onClick={() => setSelectedTrip(null)}
              className="text-sm text-gray-500 hover:text-indigo-600 mb-6"
            >
              ← Back to all trips
            </button>

            {/* Trip Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              {['itinerary', 'finances', 'route'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm min-h-[400px]">
              
              {activeTab === 'itinerary' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Live Itinerary</h3>
                  <p className="text-gray-500">API ROUTE: POST /api/itinerary/add</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">+ Add Place</button>
                </div>
              )}

              {activeTab === 'finances' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Splitwise Engine</h3>
                  <p className="text-gray-500">API ROUTE: POST /api/finance/add_expense</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">+ Add Expense</button>
                </div>
              )}

              {activeTab === 'route' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Smart Map</h3>
                  <p className="text-gray-500">API ROUTE: POST /api/ai/optimize_route</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Optimize Route with AI</button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}