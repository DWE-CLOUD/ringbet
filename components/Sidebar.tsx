"use client";

import React from 'react';
import { Grid3X3, Home, ShoppingCart, Trophy, Clock, Settings, User } from 'lucide-react';

interface SidebarProps {
  currentView: 'rings' | 'game' | 'leaderboard' | 'chat' | 'profile';
  onViewChange: (view: 'rings' | 'game' | 'leaderboard' | 'chat' | 'profile') => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems = [
    { 
      icon: () => (
        <div className="w-6 h-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg border border-emerald-400 flex items-center justify-center"
             style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)' }}>
          <div className="text-xs font-black text-emerald-400"
               style={{ textShadow: '0 0 10px rgba(16, 185, 129, 1)' }}>
            R
          </div>
        </div>
      ), 
      key: 'rings', 
      name: 'Rings' 
    },
    { icon: Trophy, key: 'leaderboard', name: 'Leaderboard' },
    { icon: User, key: 'profile', name: 'Profile' },
    { icon: Grid3X3, key: null, name: 'Games' },
    { icon: ShoppingCart, key: null, name: 'Shop' },
    { icon: Clock, key: null, name: 'History' },
    { icon: Settings, key: null, name: 'Settings' },
  ];

  return (
    <aside className="w-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] border-r border-gray-700/30 flex flex-col py-8 backdrop-blur-sm">
      <div className="flex flex-col space-y-8">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="relative mx-auto group"
          >
            <button
              onClick={() => item.key && onViewChange(item.key as any)}
              disabled={!item.key}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                currentView === item.key
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-2xl shadow-green-500/40 scale-110' 
                  : item.key
                  ? 'text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-lg cursor-pointer'
                  : 'text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {item.key === 'rings' ? (
                <item.icon />
              ) : (
                React.createElement(item.icon as any, {
                  className: `w-6 h-6 transition-transform duration-300 ${currentView === item.key ? 'scale-110' : item.key ? 'group-hover:scale-110' : ''}`
                })
              )}
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-2xl text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
              {item.name}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent border-r-gray-900"></div>
            </div>
            {/* Active indicator */}
            {currentView === item.key && (
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full animate-pulse shadow-lg"></div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}