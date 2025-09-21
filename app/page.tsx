"use client";

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SpinWheel from '@/components/SpinWheel';
import ChatSection from '@/components/ChatSectionSupabase';
import RingManager from '@/components/RingManagerSupabase';
import Leaderboard from '@/components/Leaderboard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { useAccount } from 'wagmi';

interface Participant {
  id: string;
  name: string;
  bet: number;
  avatar: string;
  color: string;
}

interface Ring {
  id: string;
  creator_address: string;
  creator_name: string;
  buy_in: number;
  max_players: number;
  current_players: number;
  total_pot: number;
  status: 'waiting' | 'active' | 'spinning' | 'finished';
  winner_address?: string;
  winner_name?: string;
  participants?: any[];
}

function AppContent() {
  const { user, isLoading, updateStats } = useAuth();
  const { address, isConnected } = useAccount();
  const [currentView, setCurrentView] = useState<'rings' | 'game' | 'leaderboard'>('rings');
  const [currentRing, setCurrentRing] = useState<Ring | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLoadingComplete, setShowLoadingComplete] = useState(false);

  const handleSpinComplete = (winner: any) => {
    if (currentRing) {
      // Award the winner
      if (winner.player_address === address) {
        updateStats(currentRing.total_pot, true);
      } else {
        updateStats(0, false);
      }
      
      // Update ring status
      setCurrentRing(prev => prev ? { ...prev, winner_address: winner.player_address, winner_name: winner.player_name, status: 'finished' } : null);
      setIsSpinning(false);
      
      // Show winner for a few seconds then allow new ring selection
      setTimeout(() => {
        setCurrentView('rings');
      }, 5000);
    }
  };

  const handleRingChange = (ring: Ring | null) => {
    setCurrentRing(ring);
    setCurrentView(ring ? 'game' : 'rings');
    setIsSpinning(false);
  };

  const startSpin = () => {
    if (currentRing && currentRing.status === 'spinning') {
      setIsSpinning(true);
    }
  };

  // Auto-start spin when ring status changes to spinning
  useEffect(() => {
    if (currentRing?.status === 'spinning' && !isSpinning) {
      setTimeout(() => setIsSpinning(true), 1000);
    }
  }, [currentRing?.status]);

  // Show loading screen first
  if (isLoading && !showLoadingComplete) {
    return <LoadingScreen onComplete={() => setShowLoadingComplete(true)} />;
  }

  // Show connect wallet if no connection
  if (!isConnected) {
    const { WalletConnect } = require('@/components/WalletConnect');
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to RingBet</h1>
          <p className="text-gray-400 mb-8">Connect your wallet to get started</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Header />
      
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1">
          {currentView === 'rings' ? (
            <div className="p-8">
              <RingManager 
                onRingChange={handleRingChange} 
              />
            </div>
          ) : currentView === 'leaderboard' ? (
            <div className="p-8">
              <Leaderboard />
            </div>
          ) : currentView === 'game' ? (
            <div className="flex">
              <div className="flex-1 p-8">
                {/* Game Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        Ring #{currentRing?.id.slice(-6) || 'Lucky Spin'}
                      </h1>
                      {currentRing?.status === 'active' && (
                        <div className="text-gray-400 text-lg mb-2">
                          Players: {currentRing.current_players}/{currentRing.max_players}
                        </div>
                      )}
                      {currentRing?.status === 'spinning' && (
                        <div className="text-green-400 text-lg mb-2">🎯 Spinning now! Winner takes ${currentRing.total_pot}</div>
                      )}
                      {currentRing?.winner_name && (
                        <div className="text-yellow-400 text-2xl font-bold mb-2">
                          🏆 {currentRing.winner_name} wins ${currentRing.total_pot}!
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentView('rings')}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-gray-600/30 hover:scale-105"
                    >
                      Back to Rings
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {/* Wheel */}
                  <div className="flex-shrink-0 relative">
                    <SpinWheel 
                      ring={currentRing}
                      isSpinning={isSpinning}
                      onSpinComplete={handleSpinComplete}
                    />
                  </div>
                </div>

                {/* Ring Info */}
                {currentRing && (
                  <div className="mt-12">
                    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-8 transition-all duration-500 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text">Ring Participants</h3>
                        <div className="text-xl bg-gradient-to-r from-green-400 to-green-300 bg-clip-text font-bold">${currentRing.total_pot} Total Pot</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {currentRing.participants?.map((participant, idx) => (
                          <div
                            key={participant.id || idx}
                            className={`bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-sm rounded-3xl p-6 text-center border-2 transition-all duration-500 hover:scale-110 cursor-pointer group ${
                              currentRing.winner_address === participant.player_address ? 'border-yellow-400/70 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 animate-pulse shadow-xl shadow-yellow-500/30' : 'border-gray-600/50 hover:border-gray-400/70 hover:shadow-lg'
                            }`}
                          >
                            <div 
                              className="w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center text-white font-bold shadow-2xl group-hover:scale-110 transition-all duration-300"
                              style={{ backgroundColor: participant.color }}
                            >
                              <span className="text-lg">{participant.avatar}</span>
                            </div>
                            <div className="text-white font-semibold truncate mb-2 group-hover:text-green-400 transition-colors duration-300">{participant.player_name}</div>
                            <div className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text font-bold text-lg">${currentRing.buy_in}</div>
                            {currentRing.winner_address === participant.player_address && (
                              <div className="text-yellow-400 font-bold text-lg mt-2 animate-bounce">🏆 WINNER!</div>
                            )}
                          </div>
                        )) || []}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Live Join Feed */}
                {currentRing && currentRing.status === 'waiting' && (
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 backdrop-blur-xl border border-green-400/40 rounded-3xl p-6 animate-pulse">
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-xl mb-3">🎯 Ring is Open!</div>
                        <div className="text-gray-300 text-sm">Waiting for more players... Buy-in: ${currentRing.buy_in}</div>
                        <div className="text-xs text-gray-400 mt-2 bg-gray-800/50 rounded-2xl px-4 py-2 inline-block">Ring starts automatically with 2+ players</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Section */}
              <div className="w-80 flex-shrink-0">
                <ChatSection 
                  ringId={currentRing?.id}
                  ringName={`Ring #${currentRing?.id.slice(-6)}`}
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Web3Provider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Web3Provider>
  );
}