import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TripDashboard from './pages/TripDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MainDashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import JoinTrip from './pages/JoinTrip';
import AddDestination from './pages/AddDestination';
import AddExpense from './pages/AddExpense';
import MyTrips from './pages/MyTrips';
import OptimizeRoute from './pages/OptimizeRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/trip_dashboard" element={<TripDashboard />}/>
        <Route path="/dashboard" element={<MainDashboard />}/>
        <Route path="/create_trip" element={<CreateTrip />}/>
        <Route path="/join_trip" element={<JoinTrip />}/>
        <Route path="/add_destination" element={<AddDestination />}/>
        <Route path="/add_expense" element={<AddExpense />}/>
        <Route path="/my_trips" element={<MyTrips />}/>
        <Route path="/optimize_route" element={<OptimizeRoute />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

