# Trip Access Control Implementation

This guide shows how to implement trip-level access control in the frontend.

## Architecture

**Trip Session Storage:**
- When user logs in to a trip (JoinTrip, CreateTrip) → `localStorage.setItem('currentTrip', { tripId })`
- When user selects a trip on Dashboard → `setTripSession(tripId)` 
- When user logs out → `localStorage.removeItem('currentTrip')`

## Files Created

### 1. `src/hooks/useTripAccess.js`
Custom hook for managing trip access:
```javascript
const { setTripSession, getTripSession, clearTripSession, hasAccessToTrip } = useTripAccess();

// Store trip session after login
setTripSession('trip-001');

// Check if user has access to specific trip
if (hasAccessToTrip('trip-001')) {
  // Allow access
}

// Clear on logout
clearTripSession();
```

### 2. `src/components/ProtectedTripRoute.jsx`
Wrapper component to protect trip-specific pages:
```javascript
<Route path="/trip/:tripId/expenses" element={
  <ProtectedTripRoute>
    <ExpensePage />
  </ProtectedTripRoute>
}/>
```

If user hasn't logged in to that trip, they're redirected to `/join_trip`.

## Updated Files

### 1. **JoinTrip.jsx**
- Imports `useTripAccess`
- Calls `setTripSession(tripId)` after successful trip login
- User now has access to trip-specific methods

### 2. **CreateTrip.jsx**
- Imports `useTripAccess`
- Calls `setTripSession(createdId)` after creating a trip
- Creator automatically logged into their new trip

### 3. **Dashboard.jsx**
- Imports `useTripAccess`
- Calls `setTripSession(trip.trip_id)` when user clicks a trip
- Clears trip session on logout (`localStorage.removeItem('currentTrip')`)

## How to Protect Trip Routes

In `App.jsx`, wrap trip-specific pages with `ProtectedTripRoute`:

```javascript
import ProtectedTripRoute from './components/ProtectedTripRoute';

// Before: Anyone could access these
<Route path="/trip/:tripId/expenses" element={<ExpensePage />}/>

// After: Only logged-in trip members can access
<Route path="/trip/:tripId/expenses" element={
  <ProtectedTripRoute>
    <ExpensePage />
  </ProtectedTripRoute>
}/>
```

## Data Flow

```
User Creates/Joins Trip
         ↓
Backend validates (trip_id, trip_pass)
         ↓
Frontend stores: localStorage['currentTrip'] = { tripId }
         ↓
User clicks trip on Dashboard
         ↓
Frontend calls: setTripSession(tripId)
         ↓
Protected pages check: hasAccessToTrip(tripId)
         ↓
If no access → Redirect to /join_trip
If access → Show trip content
```

## Best Practices

1. **Always call `setTripSession()` after:**
   - Successful trip login (JoinTrip)
   - Successful trip creation (CreateTrip)
   - User selecting a trip (Dashboard)

2. **Always clear trip session on logout:**
   - `clearTripSession()` or `localStorage.removeItem('currentTrip')`

3. **Protect trip-specific operations:**
   - Expense pages
   - Itinerary pages
   - Route optimization pages

4. **Server-side validation is still required:**
   - Frontend checks are UX only
   - Backend must verify trip access on every API call
