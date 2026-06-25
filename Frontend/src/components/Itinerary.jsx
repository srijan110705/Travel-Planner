import React, { useState } from 'react';
import axios from 'axios';

const Itinerary = ({ selectedTrip, setSelectedTrip }) => {
  const [newDestination, setNewDestination] = useState('');
  const [addDestinationLoading, setAddDestinationLoading] = useState(false);

  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // New state for inline route optimization
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [optimizeInstructions, setOptimizeInstructions] = useState('');

  const handleAddDestination = async () => {
    if (!newDestination.trim()) return;
    setAddDestinationLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/trip/add_destination', {
        trip_id: selectedTrip.trip_id,
        destination_data: newDestination.trim()
      }, { withCredentials: true });
      if (response.data.trip) setSelectedTrip(response.data.trip);
      setNewDestination('');
    } catch (error) {
      alert('Failed to add destination');
    } finally {
      setAddDestinationLoading(false);
    }
  };

  const handleRemoveDestination = async (index) => {
    try {
      const response = await axios.post('http://localhost:3000/api/trip/remove_destination', {
        trip_id: selectedTrip.trip_id,
        destination_index: index
      }, { withCredentials: true });
      if (response.data.trip) setSelectedTrip(response.data.trip);
    } catch (error) {
      alert('Failed to remove destination');
    }
  };

  const handleSuggest = async () => {
    if (!suggestionPrompt.trim()) return;
    setSuggestLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/ai/suggest', {
        prompt: suggestionPrompt
      }, { withCredentials: true });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      alert('Failed to get suggestions');
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleAddSuggested = async (suggestionObj) => {
    try {
      const response = await axios.post('http://localhost:3000/api/trip/add_destination', {
        trip_id: selectedTrip.trip_id,
        destination_data: suggestionObj 
      }, { withCredentials: true });
      if (response.data.trip) setSelectedTrip(response.data.trip);
      setSuggestions(prev => prev.filter(s => s.placeName !== suggestionObj.placeName));
    } catch (error) {
      console.error('Add suggestion error', error);
    }
  };

  // New inline optimize function
  const handleOptimizeRoute = async () => {
    setOptimizeLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/ai/optimize_route', {
        trip_id: selectedTrip.trip_id,
        instructions: optimizeInstructions
      }, { withCredentials: true });
      setOptimizedRoute(response.data.route || []);
    } catch (error) {
      alert('Failed to optimize route. Please try again.');
      console.error(error);
    } finally {
      setOptimizeLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div>
        <h3 className="font-bold text-xl mb-2 text-gray-900">Live Itinerary</h3>
        <p className="text-gray-500 text-sm mb-6">Manage your destinations and get AI suggestions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN: THE ITINERARY & AI SUGGESTIONS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h4>
            {selectedTrip.itinerary?.length ? (
              <ol className="space-y-3 text-sm text-gray-700">
                {selectedTrip.itinerary.map((destination, index) => {
                  const isObject = typeof destination === 'object' && destination !== null;
                  const placeName = isObject ? destination.placeName : destination;
                  const time = isObject ? destination.time : null;

                  return (
                    <li key={`dest-${index}`} className="rounded-2xl bg-indigo-50 p-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-indigo-700">{index + 1}.</span>{' '}
                        <span className="font-medium text-gray-900">{placeName}</span>
                        {time && time !== 'Custom' && (
                          <span className="ml-2 text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">
                            {time}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveDestination(index)}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-gray-500">No itinerary destinations have been added yet.</p>
            )}

            {/* MANUAL ADDITION */}
            <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Add New Destination</h4>
              <div className="space-y-3">
                <input
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="Enter destination name manually"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={handleAddDestination}
                  disabled={addDestinationLoading || !newDestination.trim()}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {addDestinationLoading ? 'Adding...' : 'Add Destination'}
                </button>
              </div>
            </div>

            {/* AI IDEA GENERATOR */}
            <div className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                ✨ AI Idea Generator
              </h4>
              <p className="text-sm text-gray-500 mb-4">Ask Gemini for highly specific suggestions!</p>
              <div className="space-y-3">
                <input
                  value={suggestionPrompt}
                  onChange={(e) => setSuggestionPrompt(e.target.value)}
                  placeholder="e.g. Find 3 cozy cafes near the Eiffel Tower"
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={handleSuggest}
                  disabled={suggestLoading || !suggestionPrompt.trim()}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {suggestLoading ? 'Brainstorming...' : 'Get Ideas'}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Gemini's Suggestions:</h5>
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{s.placeName}</span>
                        <span className="text-xs text-indigo-400 font-bold ml-2">{s.time}</span>
                      </div>
                      <button
                        onClick={() => handleAddSuggested(s)}
                        className="text-xs font-bold text-indigo-600 hover:text-white px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-600 transition"
                      >
                        Add +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INLINE ROUTE OPTIMIZER */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-md text-center">
            <h4 className="text-xl font-bold text-white mb-2">Optimize Route</h4>
            <p className="text-indigo-100 text-sm mb-5">Let AI sort your itinerary for the most efficient travel path.</p>
            
            <input
              value={optimizeInstructions}
              onChange={(e) => setOptimizeInstructions(e.target.value)}
              placeholder="Any specific rules? (e.g. End at a cafe)"
              className="w-full rounded-2xl border border-indigo-400 bg-indigo-500/50 px-4 py-3 text-sm text-white placeholder-indigo-200 outline-none focus:border-white focus:ring-1 focus:ring-white mb-4"
            />

            <button 
              onClick={handleOptimizeRoute}
              disabled={optimizeLoading || !selectedTrip.itinerary?.length}
              className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition w-full shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {optimizeLoading ? 'Calculating optimal route...' : 'Map Best Route →'}
            </button>

            {/* Display Optimized Route Results */}
            {optimizedRoute.length > 0 && (
              <div className="mt-6 text-left bg-indigo-700/50 p-5 rounded-2xl border border-indigo-500 text-white">
                <h5 className="font-semibold text-sm uppercase tracking-wide text-indigo-200 mb-3">AI Recommended Path</h5>
                <ol className="space-y-3">
                  {optimizedRoute.map((place, index) => (
                    <li key={`opt-${index}`} className="flex items-start gap-3 text-sm font-medium">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-400 text-indigo-900 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="mt-0.5">{place}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Trip Members</h4>
            {selectedTrip.members?.length ? (
              <ul className="space-y-3 text-sm text-gray-700">
                {selectedTrip.members.map((member, index) => (
                  <li key={`member-${index}`} className="rounded-2xl bg-slate-50 p-4 font-medium">
                    {/* Now it will successfully read the populated username */}
                    {member?.username || 'Unknown User'} 
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No members are currently listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;