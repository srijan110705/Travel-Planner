import { Navigate, useParams } from 'react-router-dom';
import { useTripAccess } from '../hooks/useTripAccess';

/**
 * Protected component wrapper for trip-specific pages
 * Redirects to /join_trip if user doesn't have access to the trip
 */
export const ProtectedTripRoute = ({ children }) => {
  const { tripId } = useParams();
  const { hasAccessToTrip } = useTripAccess();

  if (!hasAccessToTrip(tripId)) {
    return <Navigate to="/join_trip" replace />;
  }

  return children;
};
