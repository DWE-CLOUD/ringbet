"use client";

import { Menu, Star, Plus, Bell, MessageSquare, ChevronDown, LogOut, User, Settings, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export default function Header({ isDemoMode = false, onToggleDemoMode }: HeaderProps) {
  const { user, disconnect } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] border-b border-gray-700/30 px-6 py-4 backdrop-blur-sm relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-300 cursor-pointer group">
            <Menu className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl border-2 border-emerald-400 flex items-center justify-center shadow-lg"
                   style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.8), inset 0 0 15px rgba(0,0,0,0.9)' }}>
                <div className="text-lg font-black text-emerald-400 animate-pulse"
                     style={{ textShadow: '0 0 15px rgba(16, 185, 129, 1), 0 0 30px rgba(16, 185, 129, 0.6)' }}>
                  R
                </div>
              </div>
              <div className="absolute inset-0 w-8 h-8 bg-emerald-400/20 rounded-xl animate-ping"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">RingBet</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-3xl font-bold shadow-lg hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="w-4 h-4 bg-yellow-600 rounded-full animate-bounce"></div>
            <span className="text-lg">${user?.balance?.toLocaleString() || '0'}</span>
          </div>

          {/* Real/Demo Mode Toggle */}
          <div className="flex items-center bg-gray-800/50 rounded-full p-1 border border-gray-600/30">
            <button
              onClick={() => !isDemoMode || onToggleDemoMode?.()}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                !isDemoMode
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Real
            </button>
            <button
              onClick={() => isDemoMode || onToggleDemoMode?.()}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isDemoMode
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Demo
            </button>
          </div>

          <div className="p-3 hover:bg-gray-800/50 rounded-2xl transition-all duration-300 cursor-pointer group">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          </div>
          <div className="p-3 hover:bg-gray-800/50 rounded-2xl transition-all duration-300 cursor-pointer group">
            <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/50 p-3 rounded-3xl transition-all duration-300 group"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div 
                className="w-10 h-10 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-green-400/30 group-hover:scale-110 transition-all duration-300 font-bold text-white"
                style={{ backgroundColor: '#10b981' }}
              >
                {user?.avatar || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium group-hover:text-green-400 transition-colors duration-300">{user?.username || 'Player'}</span>
                <span className="text-xs text-gray-400">Level {Math.floor((user?.gamesPlayed || 0) / 10) + 1}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-gradient-to-br from-gray-900/98 to-gray-800/98 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl z-[100] animate-in slide-in-from-top-4 duration-300">
                <div className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div 
                      className="w-12 h-12 rounded-3xl flex items-center justify-center shadow-lg font-bold text-white"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      {user?.avatar || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{user?.username || 'Player'}</div>
                      <div className="text-sm text-gray-400">Level {Math.floor((user?.gamesPlayed || 0) / 10) + 1}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
                      <div className="text-green-400 font-bold text-lg">${user?.totalWinnings?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-400">Winnings</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
                      <div className="text-blue-400 font-bold text-lg">{user?.gamesPlayed || 0}</div>
                      <div className="text-xs text-gray-400">Games</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
                      <div className="text-purple-400 font-bold text-lg">{user?.winRate?.toFixed(1) || '0.0'}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-700/50 pt-4 space-y-2">
                    <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800/50 rounded-2xl transition-all duration-300 text-left group">
                      <User className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                      <span className="text-gray-300 group-hover:text-white">View Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800/50 rounded-2xl transition-all duration-300 text-left group">
                      <Settings className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                      <span className="text-gray-300 group-hover:text-white">Settings</span>
                    </button>
                    <button 
                      onClick={disconnect}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-red-500/20 rounded-2xl transition-all duration-300 text-left group"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}