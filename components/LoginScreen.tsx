"use client";

import { useState, FormEvent } from 'react';
import { Play, Shield, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      login(username.trim());
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
          {/* Centered Logo Container */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Logo Container with proper bounds */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-8">
              {/* Contained Outer Glow Effects */}
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute inset-4 bg-green-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-emerald-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Contained Rotating Ring Effects */}
              <div className="absolute inset-2 rounded-full border-2 border-emerald-400/30 animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="absolute inset-6 rounded-full border-2 border-green-400/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
              <div className="absolute inset-10 rounded-full border border-emerald-500/15 animate-spin" style={{ animationDuration: '25s' }}></div>
              
              {/* Main Logo Hub - Properly Centered */}
              <div 
                className="relative w-48 h-48 rounded-full border-4 border-emerald-400 flex items-center justify-center shadow-2xl overflow-hidden z-10"
                style={{
                  boxShadow: '0 0 80px rgba(16, 185, 129, 1), inset 0 0 60px rgba(0,0,0,0.9), 0 0 150px rgba(16, 185, 129, 0.6)'
                }}
              >
                {/* Multiple layered backgrounds for depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-900/40 via-black to-emerald-900/40 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-800/30 via-black to-green-800/30"></div>
                
                {/* Giant Glowing R - Properly Centered */}
                <div 
                  className="relative z-20 flex items-center justify-center w-full h-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
                  }}
                >
                  <div 
                    className="text-8xl font-black text-emerald-400 drop-shadow-2xl animate-pulse select-none"
                    style={{
                      textShadow: '0 0 40px rgba(16, 185, 129, 1), 0 0 80px rgba(16, 185, 129, 0.8), 0 0 120px rgba(16, 185, 129, 0.6), 0 6px 12px rgba(0,0,0,0.8)',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '900'
                    }}
                  >
                    R
                  </div>
                </div>
                
                {/* Contained inner rings */}
                <div className="absolute inset-4 rounded-full border border-emerald-400/60 animate-spin z-10" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-6 rounded-full border border-emerald-400/40 animate-spin z-10" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent mb-4">
                RingBet
              </h1>
              <p className="text-gray-400 text-lg">Ultimate Roulette Experience</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl border-2 border-emerald-400 flex items-center justify-center"
                       style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' }}>
                    <div className="text-2xl font-black text-emerald-400"
                         style={{ textShadow: '0 0 15px rgba(16, 185, 129, 1)' }}>
                      R
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  RingBet
                </h1>
              </div>
              <p className="text-gray-400">Join thousands of players worldwide</p>
            </div>

            {/* Login Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Enter your name to continue playing</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-900/50 border-2 border-gray-600/50 focus:border-emerald-400/70 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-lg"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                  {username && (
                    <div className="mt-2 text-sm text-gray-400">
                      {username.length >= 3 ? (
                        <span className="text-emerald-400 flex items-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                          Looks good!
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Need at least 3 characters
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || username.length < 3}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Playing</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Stats - Mobile Only */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-400">2.4K+</div>
                    <div className="text-xs text-gray-400">Players</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">$8.2M</div>
                    <div className="text-xs text-gray-400">Paid Out</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">156</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Secure • Fair • Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}