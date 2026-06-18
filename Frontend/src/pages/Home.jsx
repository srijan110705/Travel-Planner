import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home=()=> {
  // State to track if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(false);

  // This effect runs every time isDarkMode changes.
  // It adds or removes the 'dark' class from the main <html> tag.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    // Added dark mode gradient backgrounds (dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950)
    // transition-colors duration-500 makes the switch smooth!
    <div className="min-h-screen w-full transition-colors duration-500 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 relative overflow-hidden font-sans flex flex-col">
      
      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          {/* Text adapts to dark mode */}
          <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 tracking-tight transition-colors">✈️ TripPlanner</span>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* THE THEME TOGGLE BUTTON */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-yellow-400 hover:bg-indigo-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/login" className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            + Create Trip
          </Link>
          <Link to="/login" className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition shadow-md">
            Login
          </Link>
        </div>
      </nav>

      {/* Main Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center mt-10 md:mt-12 px-4 max-w-4xl mx-auto flex-grow">
        
        {/* AI Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 rounded-full shadow-sm border border-indigo-200 dark:border-indigo-700/50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          AI-Powered Travel Agent v2.0
        </div>

        {/* Hero Heading - The gradient text stays beautiful in both modes! */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6 pb-2 transition-colors">
          The End of Messy <br className="hidden md:block" /> Travel Planning
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed transition-colors">
          Experience the first AI travel agent with live collaborative lobbies, smart route optimization, and automated debt splitting.
        </p>

        {/* Call to Action Button */}
        <Link to="/login" className="group flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:scale-105 shadow-xl hover:shadow-indigo-500/30">
          Start Planning
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </main>

      {/* Feature Highlights */}
      <div className="relative z-10 flex flex-wrap justify-center gap-8 md:gap-16 mt-12 pb-12 opacity-80 text-gray-600 dark:text-gray-400 font-medium text-sm transition-colors">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <p>AI Route Optimization</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">💸</span>
          <p>Smart Debt Splitting</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">⚡</span>
          <p>Real-Time Collabaration</p>
        </div>
      </div>

    </div>
  );
}
export default Home;