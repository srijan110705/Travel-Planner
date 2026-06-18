import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import TravelAssistant from './pages/TravelAssisstant';
import TripDashboard from './pages/TripDashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/travel_assisstant" element={<TravelAssistant />}/>
        <Route path="/trip_dashboard" element={<TripDashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

