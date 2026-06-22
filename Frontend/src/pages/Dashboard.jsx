import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Finances from '../components/Finances'; // Make sure this path is correct!
import { useTripAccess } from '../hooks/useTripAccess';
 const Dashboard=()=> {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTripSession } = useTripAccess();
  
  // State Management
  const [myTrips, setMyTrips] = useState([]); // Holds data from GET /api/trip/my_trips
  const [selectedTrip, setSelectedTrip] = useState(null); // Which trip the user clicked
  const [activeTab, setActiveTab] = useState('itinerary'); // Tabs inside a specific trip
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user info
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  // 0. Fetch current user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // 1. Fetch Trips when the Dashboard loads
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // API ROUTE: Get all trips for this user
        const response = await axios.get('http://localhost:3000/api/trip/my_trips', { withCredentials: true });
        const trips = response.data.trips || [];
        setMyTrips(trips);

        // If navigated here after creating a trip, auto-select it
        const selId = location?.state?.selectedTripId;
        if (selId) {
          const found = trips.find(t => t.trip_id === selId);
          if (found) {
            setSelectedTrip(found);
            setActiveTab('itinerary');
          }
        }
      } catch (error) {
        console.error("Failed to fetch trips", error);
        // If unauthorized, send them back to login
        if (error.response?.status === 401) navigate('/login');
      }
    };
    
    // Fetching live data from backend!
    fetchTrips(); 
    
  }, [navigate, location]);

  // 2. Fetch optimized route when route tab is active
  useEffect(() => {
    const fetchRoute = async () => {
      if (activeTab !== 'route' || !selectedTrip) return;
      if (!selectedTrip.itinerary?.length) {
        setOptimizedRoute([]);
        return;
      }

      setRouteLoading(true);
      setRouteError('');

      try {
        const response = await axios.post('http://localhost:3000/api/trip/optimize_route', {
          trip_id: selectedTrip.trip_id,
          instructions: ""
        }, { withCredentials: true });

        setOptimizedRoute(response.data.route || []);
      } catch (error) {
        console.error('Route optimization error', error);
        setRouteError(error.response?.data?.message || 'Failed to load optimized route');
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [activeTab, selectedTrip]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentTrip');
      navigate('/login');
    } catch (err) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentTrip');
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
                onClick={() => navigate('/create_trip')}
                className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors"
              >
                Create Trip
              </button>
            <button 
              onClick={() => navigate('/join_trip')}
              className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-colors">
              Join with Credentials
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
            {selectedTrip ? selectedTrip.trip_name : `Welcome back, ${currentUser?.username || 'Traveler'}`}
          </h2>
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'T'}
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
                  onClick={() => {
                    setTripSession(trip.trip_id);
                    setSelectedTrip(trip);
                  }}
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
                <div className="animate-in fade-in duration-500 space-y-6">
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">Live Itinerary</h3>
                    <p className="text-gray-500 text-sm mb-6">This trip data is loaded from the backend.</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h4>
                      {selectedTrip.itinerary?.length ? (
                        <ol className="space-y-3 text-sm text-gray-700">
                          {selectedTrip.itinerary.map((destination, index) => (
                            <li key={`${destination}-${index}`} className="rounded-2xl bg-indigo-50 p-4">
                              <span className="font-semibold text-indigo-700">{index + 1}.</span> {destination}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-gray-500">No itinerary destinations have been added yet.</p>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Trip Members</h4>
                      {selectedTrip.members?.length ? (
                        <ul className="space-y-3 text-sm text-gray-700">
                          {selectedTrip.members.map((member, index) => {
                            const label = member?.username || member?.email || member?._id || `Member ${index + 1}`;
                            return (
                              <li key={`${label}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                                {label}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No members are currently listed for this trip.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finances' && (
                <div className="animate-in fade-in duration-500">
                  {/* --- THE FINANCES COMPONENT HAS BEEN PLUGGED IN HERE --- */}
                  <Finances 
                    tripId={selectedTrip.trip_id} 
                    initialExpenses={selectedTrip.expenses || []} 
                    members={selectedTrip.members?.map(m => m.username || m._id) || []} 
                  />
                </div>
              )}

              {activeTab === 'route' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Optimized Route</h3>
                  <p className="text-gray-500 text-sm mb-6">This route is generated by the backend optimization service.</p>

                  {routeLoading ? (
                    <div className="rounded-3xl border border-gray-200 p-12 text-center bg-gray-50 text-gray-500">
                      <p className="font-medium">Loading optimized route...</p>
                    </div>
                  ) : routeError ? (
                    <div className="rounded-3xl border border-rose-200 p-8 text-center bg-rose-50 text-rose-700">
                      <p className="font-semibold">{routeError}</p>
                      <p className="text-sm text-rose-600 mt-2">Make sure your trip itinerary has at least one destination.</p>
                    </div>
                  ) : selectedTrip.itinerary?.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200 p-12 text-center bg-gray-50 text-gray-500">
                      <p className="font-medium">No itinerary destinations yet.</p>
                      <p className="text-sm mt-2">Add destinations to this trip before optimizing the route.</p>
                    </div>
                  ) : optimizedRoute?.length ? (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Route Order</h4>
                        <ol className="space-y-3 text-sm text-gray-700">
                          {optimizedRoute.map((stop, index) => (
                            <li key={`${stop}-${index}`} className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">{index + 1}</span>
                              <span>{stop}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-md">
                        <p className="font-semibold">Route generated from the backend optimized itinerary.</p>
                        <p className="text-sm text-indigo-100 mt-2">Refresh the route by re-selecting the Route tab or adding new itinerary items.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-gray-200 p-12 text-center bg-gray-50 text-gray-500">
                      <p className="font-medium">No optimized route available yet.</p>
                    </div>
                  )}
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