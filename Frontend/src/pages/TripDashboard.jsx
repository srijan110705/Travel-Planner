import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Initialize the socket connection outside the component
const socket = io('http://localhost:3000', { withCredentials: true });

const TripDashboard = ({ tripId }) => {
    const [tripData, setTripData] = useState(null);
    const [newDestination, setNewDestination] = useState("");

    useEffect(() => {
        // 1. Tell the backend to put us in this specific trip's room
        socket.emit('join_trip', tripId);

        // 2. Listen for the broadcast from the Express controller
        socket.on('trip_updated', (updatedMongoDBData) => {
            // Instantly update the screen when someone else makes a change!
            setTripData(updatedMongoDBData);
        });

        // Cleanup listener when the user leaves the page
        return () => {
            socket.off('trip_updated');
        };
    }, [tripId]);

    // 3. Saving data works exactly like a normal web app
    const handleSave = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/trips/add_destination', {
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