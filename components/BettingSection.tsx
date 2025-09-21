"use client";

import { useState } from 'react';

export default function BettingSection() {
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);

  return (
    <div className="space-y-6 w-72">
      <h3 className="text-3xl text-white font-medium">Your bet</h3>
      
      {/* Multiplier Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedMultiplier(1)}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
            selectedMultiplier === 1
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50'
              : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 border border-gray-600'
          }`}
        >
          x1
        </button>
        <button
          onClick={() => setSelectedMultiplier(2)}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
            selectedMultiplier === 2
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
              : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 border border-gray-600'
          }`}
        >
          x2
        </button>
        <button
          onClick={() => setSelectedMultiplier(3)}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
            selectedMultiplier === 3
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
              : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 border border-gray-600'
          }`}
        >
          x3
        </button>
      </div>

      {/* Bet Amount */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50"></div>
        <span className="text-3xl text-white font-semibold">1000</span>
      </div>

      {/* Place Bet Button */}
      <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105">
        Place bet
      </button>
    </div>
  );
}