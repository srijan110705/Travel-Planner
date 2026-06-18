import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import TravelAssistant from './pages/TravelAssisstant';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/travel_assisstant" element={<TravelAssistant />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

