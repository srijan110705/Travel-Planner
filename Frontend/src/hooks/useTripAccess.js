import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage trip access control
 * Stores/retrieves logged-in trip from localStorage
 */
export const useTripAccess = () => {
  const navigate = useNavigate();

  // Store trip login session (call after successful trip login)
  const setTripSession = (tripId) => {
    localStorage.setItem('currentTrip', JSON.stringify({ tripId }));
  };

  // Get current trip session
  const getTripSession = () => {
    const trip = localStorage.getItem('currentTrip');
    return trip ? JSON.parse(trip) : null;
  };

  // Clear trip session (call on trip logout)
  const clearTripSession = () => {
    localStorage.removeItem('currentTrip');
  };

  // Check if user has access to specific trip
  const hasAccessToTrip = (tripId) => {
    const session = getTripSession();
    return session && session.tripId === tripId;
  };

  return {
    setTripSession,
    getTripSession,
    clearTripSession,
    hasAccessToTrip,
  };
};
