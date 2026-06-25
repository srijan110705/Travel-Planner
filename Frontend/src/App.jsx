import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateTrip from './pages/CreateTrip';
import JoinTrip from './pages/JoinTrip';
import MyTrips from './pages/MyTrips';



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/create_trip" element={<CreateTrip />}/>
        <Route path="/join_trip" element={<JoinTrip />}/>
        <Route path="/my_trips" element={<MyTrips />}/>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App

