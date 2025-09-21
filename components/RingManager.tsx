"use client";

import { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Plus, DollarSign } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  bet: number;
  avatar: string;
  color: string;
}

interface Ring {
  id: string;
  name: string;
  creator: string;
  minBet: number;
  maxParticipants: number;
  participants: Participant[];
  status: 'waiting' | 'active' | 'spinning' | 'finished';
  timeLeft: number;
  winner?: Participant;
  totalPot: number;
}

interface RingManagerProps {
  onRingChange: (ring: Ring | null) => void;
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  currentUser: string;
}

export default function RingManager({ onRingChange, balance, onBalanceChange, currentUser }: RingManagerProps) {
  const [rings, setRings] = useState<Ring[]>([]);
  const [activeRing, setActiveRing] = useState<Ring | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRingName, setNewRingName] = useState('');
  const [minBet, setMinBet] = useState(100);

  // Create initial demo rings
  useEffect(() => {
    const demoRings: Ring[] = [
      {
        id: '1',
        name: 'High Rollers',
        creator: currentUser,
        minBet: 500,
        maxParticipants: 8,
        participants: [
          { id: 'creator', name: currentUser, bet: minBet, avatar: currentUser.slice(0, 2).toUpperCase(), color: '#10b981' },
          { id: '2', name: 'cryptoking', bet: 750, avatar: 'CK', color: '#3b82f6' },
          { id: '3', name: 'gamblelord', bet: 1000, avatar: 'GL', color: '#f59e0b' },
        ],
        status: 'waiting',
        timeLeft: 45,
        totalPot: 2250
      },
      {
        id: '2',
        name: 'Quick Spins',
        creator: 'speedster',
        minBet: 50,
        maxParticipants: 12,
        participants: [
          { id: '4', name: 'speedster', bet: 50, avatar: 'SP', color: '#ef4444' },
          { id: '5', name: 'fastbet', bet: 75, avatar: 'FB', color: '#8b5cf6' },
          { id: '6', name: 'quickwin', bet: 100, avatar: 'QW', color: '#06b6d4' },
          { id: '7', name: 'rushmore', bet: 50, avatar: 'RM', color: '#f97316' },
          { id: '8', name: 'lightning', bet: 200, avatar: 'LN', color: '#84cc16' },
        ],
        status: 'active',
        timeLeft: 23,
        totalPot: 475
      }
    ];
    setRings(demoRings);
  }, []);

  // Timer for active rings
  useEffect(() => {
    const timer = setInterval(() => {
      setRings(prevRings => 
        prevRings.map(ring => {
          if (ring.status === 'active' && ring.timeLeft > 0) {
            const newTimeLeft = ring.timeLeft - 1;
            if (newTimeLeft === 0) {
              // Ring finished, select winner
              const winner = ring.participants[Math.floor(Math.random() * ring.participants.length)];
              return { ...ring, status: 'spinning', winner, timeLeft: 0 };
            }
            return { ...ring, timeLeft: newTimeLeft };
          }
          return ring;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const createRing = () => {
    if (!newRingName.trim()) return;

    const newRing: Ring = {
      id: Date.now().toString(),
      name: newRingName,
      creator: 'themaker',
      minBet,
      maxParticipants: 8,
      participants: [
        { id: 'creator', name: 'themaker', bet: minBet, avatar: 'TM', color: '#10b981' }
      ],
      status: 'waiting',
      timeLeft: 60,
      totalPot: minBet
    };

    setRings(prev => [newRing, ...prev]);
    onBalanceChange(balance - minBet);
    setNewRingName('');
    setShowCreateForm(false);
  };

  const joinRing = (ringId: string, betAmount: number) => {
    if (balance < betAmount) return;

    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#f97316', '#84cc16', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setRings(prevRings => 
      prevRings.map(ring => {
        if (ring.id === ringId && ring.participants.length < ring.maxParticipants) {
          // Check if user already in ring
          if (ring.participants.some(p => p.name === currentUser)) return ring;
          
          const newParticipant: Participant = {
            id: Date.now().toString(),
            name: currentUser,
            bet: betAmount,
            avatar: currentUser.slice(0, 2).toUpperCase(),
            color: randomColor
          };

          const updatedRing = {
            ...ring,
            participants: [...ring.participants, newParticipant],
            totalPot: ring.totalPot + betAmount,
            status: ring.participants.length + 1 >= 2 ? 'active' as const : ring.status
          };

          return updatedRing;
        }
        return ring;
      })
    );

    onBalanceChange(balance - betAmount);
  };

  // Simulate other players joining rings randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setRings(prevRings => 
        prevRings.map(ring => {
          // Only add to waiting rings that aren't full and don't have too many participants yet
          if (ring.status === 'waiting' && ring.participants.length < ring.maxParticipants && 
              ring.participants.length < 6 && Math.random() > 0.7) {
            
            const botNames = ['CryptoKing', 'LuckyPlayer', 'SpinMaster', 'WheelWinner', 'BetBeast', 'RingLord', 'Fortune7'];
            const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#84cc16', '#ec4899'];
            
            const availableName = botNames.find(name => 
              !ring.participants.some(p => p.name === name)
            );
            
            if (!availableName) return ring;
            
            const betAmount = Math.max(ring.minBet, Math.floor(Math.random() * 500) + ring.minBet);
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const newParticipant: Participant = {
              id: Date.now().toString() + Math.random(),
              name: availableName,
              bet: betAmount,
              avatar: availableName[0].toUpperCase() + availableName[1]?.toUpperCase() || '',
              color: randomColor
            };

            return {
              ...ring,
              participants: [...ring.participants, newParticipant],
              totalPot: ring.totalPot + betAmount,
              status: ring.participants.length + 1 >= 2 ? 'active' as const : ring.status
            };
          }
          return ring;
        })
      );
    }, 8000); // Every 8 seconds, chance for someone to join

    return () => clearInterval(interval);
  }, []);

  const selectRing = (ring: Ring) => {
    setActiveRing(ring);
    onRingChange(ring);
  };

  return (
    <div className="space-y-6">
      {/* Create Ring Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Betting Rings</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ring</span>
        </button>
      </div>

      {/* Create Ring Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-600/50 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl text-white mb-4">Create New Ring</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Ring Name</label>
              <input
                type="text"
                value={newRingName}
                onChange={(e) => setNewRingName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
                placeholder="Enter ring name"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Minimum Bet</label>
              <input
                type="number"
                value={minBet}
                onChange={(e) => setMinBet(Number(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
                min="10"
                step="10"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createRing}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/30 hover:scale-105"
            >
              Create & Join
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-gray-600/30 hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Ring Display */}
      {activeRing && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-xl border border-green-400/40 rounded-3xl p-8 mb-8 shadow-2xl shadow-green-900/20 animate-in slide-in-from-left-4 duration-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl text-white font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text">{activeRing.name}</h3>
            <div className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
              activeRing.status === 'waiting' ? 'bg-yellow-500 text-black' :
              activeRing.status === 'active' ? 'bg-green-500 text-black' :
              activeRing.status === 'spinning' ? 'bg-purple-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {activeRing.status.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text">${activeRing.totalPot}</div>
              <div className="text-gray-400">Total Pot</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text">{activeRing.participants.length}/{activeRing.maxParticipants}</div>
              <div className="text-gray-400">Players</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text">
                {activeRing.status === 'active' ? `${Math.floor(activeRing.timeLeft / 60)}:${String(activeRing.timeLeft % 60).padStart(2, '0')}` : '--:--'}
              </div>
              <div className="text-gray-400">Time Left</div>
            </div>
          </div>

          {activeRing.winner && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-3xl p-6 text-center backdrop-blur-sm animate-pulse">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">{activeRing.winner.name} wins ${activeRing.totalPot}!</div>
            </div>
          )}
        </div>
      )}

      {/* Rings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rings.map(ring => (
          <div
            key={ring.id}
            className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
              activeRing?.id === ring.id ? 'border-green-400/60 bg-gradient-to-br from-green-900/20 to-emerald-900/10 shadow-green-900/20 shadow-xl scale-105' : 'border-gray-700/50 hover:border-green-500/50'
            }`}
            onClick={() => selectRing(ring)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">{ring.name}</h3>
              <div className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-lg transition-all duration-300 hover:scale-110 ${
                ring.status === 'waiting' ? 'bg-yellow-500 text-black' :
                ring.status === 'active' ? 'bg-green-500 text-black' :
                ring.status === 'spinning' ? 'bg-purple-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {ring.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text">${ring.totalPot}</div>
                <div className="text-xs text-gray-400">Total Pot</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text">{ring.participants.length}/{ring.maxParticipants}</div>
                <div className="text-xs text-gray-400">Players</div>
              </div>
            </div>

            {/* Participants */}
            <div className="flex flex-wrap gap-1 mb-3">
              {ring.participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm rounded-2xl px-3 py-2 transition-all duration-300 hover:scale-105 hover:bg-gray-700/60"
                >
                  <div 
                    className="w-5 h-5 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.avatar[0]}
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{participant.name}</span>
                  <span className="text-sm text-green-400 font-bold">${participant.bet}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {ring.status === 'waiting' && !ring.participants.some(p => p.name === currentUser) && (
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    joinRing(ring.id, ring.minBet);
                  }}
                  disabled={balance < ring.minBet}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 disabled:scale-100"
                >
                  Join Ring (${ring.minBet})
                </button>
                {ring.minBet * 2 <= balance && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      joinRing(ring.id, ring.minBet * 2);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
                  >
                    Double Bet (${ring.minBet * 2})
                  </button>
                )}
              </div>
            )}

            {ring.status === 'active' && (
              <div className="text-center text-green-400 font-medium bg-green-400/10 rounded-2xl py-2 backdrop-blur-sm">
                <Clock className="w-4 h-4 inline mr-1 animate-spin" />
                {Math.floor(ring.timeLeft / 60)}:{String(ring.timeLeft % 60).padStart(2, '0')} remaining
              </div>
            )}

            {ring.winner && (
              <div className="text-center text-yellow-400 font-medium bg-yellow-400/10 rounded-2xl py-2 backdrop-blur-sm animate-pulse">
                <Trophy className="w-4 h-4 inline mr-1 animate-bounce" />
                {ring.winner.name} won ${ring.totalPot}!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}