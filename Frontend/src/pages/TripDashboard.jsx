import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TripDashboard = ({ tripId }) => {
    const [tripData, setTripData] = useState(null);
    const [newDestination, setNewDestination] = useState("");

    const refreshTrip = async () => {
        if (!tripId) return;

        try {
            const response = await axios.get(`http://localhost:3000/api/trip/${tripId}`, { withCredentials: true });
            setTripData(response.data.trip);
        } catch (error) {
            console.error('Failed to refresh trip data', error);
        }
    };

    useEffect(() => {
        refreshTrip();
    }, [tripId]);

    // 3. Saving data works exactly like a normal web app
    const handleSave = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/trip/add_destination', {
                trip_id: tripId,
                destination_data: newDestination
            }, { withCredentials: true });

            // Update our own screen immediately so it feels fast
            setTripData(response.data.trip);
            setNewDestination("");
            
        } catch (error) {
            console.error("Failed to save", error);
        }
    };

    return (
        <div>
            <h2>Trip Itinerary</h2>
            
            {/* Render the trip data */}
            <ul>
                {tripData?.itinerary?.map((dest, index) => (
                    <li key={index}>{dest}</li>
                ))}
            </ul>

            <div className="flex gap-3 mt-4">
                <button onClick={refreshTrip} className="px-4 py-2 bg-indigo-600 text-white rounded">Refresh Trip</button>
            </div>

            {/* Input to add new destination */}
            <input 
                value={newDestination} 
                onChange={(e) => setNewDestination(e.target.value)} 
                placeholder="Add a place..."
            />
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default TripDashboard;