"use client";

import { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Plus, DollarSign, Loader2 } from 'lucide-react';
import { useRingsContract } from '@/hooks/useRingsContract';
import { RingEvents } from '@/components/RingEvents';
import { formatEther, parseEther } from 'viem';
import { useAuth } from '@/contexts/AuthContext';
import { useReadContract } from 'wagmi';
import { RINGS_ABI, RINGS_CONTRACT_ADDRESS } from '@/lib/contracts/abi';

interface RingData {
  id: number;
  buyIn: string;
  maxPlayers: number;
  participants: string[];
  isActive: boolean;
  totalPot: string;
}

interface RingManagerProps {
  onRingChange: (ring: any) => void;
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  currentUser: string;
}

export default function RingManager({ onRingChange, balance, onBalanceChange, currentUser }: RingManagerProps) {
  const [rings, setRings] = useState<RingData[]>([]);
  const [activeRing, setActiveRing] = useState<RingData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [buyInAmount, setBuyInAmount] = useState('0.001');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { 
    address, 
    nextRingId, 
    createRing, 
    joinRing, 
    isWriting 
  } = useRingsContract();

  // Load existing rings
  const loadRings = async () => {
    if (!nextRingId) return;
    
    const ringsData: RingData[] = [];
    const ringCount = Number(nextRingId);
    
    for (let i = 0; i < ringCount; i++) {
      try {
        const { data: ringData } = useReadContract({
          address: RINGS_CONTRACT_ADDRESS,
          abi: RINGS_ABI,
          functionName: 'rings',
          args: [BigInt(i)],
        });
        
        if (ringData) {
          const [id, buyIn, maxPlayersCount, , isActive] = ringData as any;
          ringsData.push({
            id: i,
            buyIn: formatEther(buyIn),
            maxPlayers: Number(maxPlayersCount),
            participants: [], // Would need events to track participants
            isActive,
            totalPot: formatEther(buyIn), // Would calculate from participants
          });
        }
      } catch (error) {
        console.error(`Error loading ring ${i}:`, error);
      }
    }
    
    setRings(ringsData);
  };

  useEffect(() => {
    loadRings();
  }, [nextRingId]);

  // Handle ring events
  const handleRingCreated = (ringId: bigint, buyIn: bigint, maxPlayers: bigint) => {
    const newRing: RingData = {
      id: Number(ringId),
      buyIn: formatEther(buyIn),
      maxPlayers: Number(maxPlayers),
      participants: [address || ''],
      isActive: true,
      totalPot: formatEther(buyIn),
    };
    
    setRings(prev => [...prev, newRing]);
  };

  const handlePlayerJoined = (ringId: bigint, player: string) => {
    setRings(prev => 
      prev.map(ring => {
        if (ring.id === Number(ringId)) {
          const updatedParticipants = [...ring.participants, player];
          const newTotalPot = parseEther(ring.buyIn) * BigInt(updatedParticipants.length);
          
          return {
            ...ring,
            participants: updatedParticipants,
            totalPot: formatEther(newTotalPot),
          };
        }
        return ring;
      })
    );
  };

  const handleWinnerDeclared = (ringId: bigint, winner: string, prize: bigint) => {
    setRings(prev => 
      prev.map(ring => {
        if (ring.id === Number(ringId)) {
          return {
            ...ring,
            isActive: false,
          };
        }
        return ring;
      })
    );
    
    // Update user stats if they won
    if (winner.toLowerCase() === address?.toLowerCase()) {
      user?.updateStats(Number(formatEther(prize)), true);
    }
  };

  const handleCreateRing = async () => {
    if (!buyInAmount || Number(buyInAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const buyInWei = parseEther(buyInAmount);
      await createRing(Number(buyInWei), maxPlayers);
      setShowCreateForm(false);
      setBuyInAmount('0.001');
      setMaxPlayers(4);
    } catch (error) {
      console.error('Error creating ring:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRing = async (ringId: number, buyIn: string) => {
    setIsLoading(true);
    try {
      const buyInWei = parseEther(buyIn);
      await joinRing(ringId, Number(buyInWei));
    } catch (error) {
      console.error('Error joining ring:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectRing = (ring: RingData) => {
    setActiveRing(ring);
    onRingChange(ring);
  };

  return (
    <div className="space-y-6">
      {/* Event Listeners */}
      <RingEvents
        onRingCreated={handleRingCreated}
        onPlayerJoined={handlePlayerJoined}
        onWinnerDeclared={handleWinnerDeclared}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Betting Rings</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!address}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ring</span>
        </button>
      </div>

      {/* Wallet Connection Alert */}
      {!address && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-300">
          Please connect your wallet to create or join rings
        </div>
      )}

      {/* Create Ring Form */}
      {showCreateForm && address && (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-600/50 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl text-white mb-4">Create New Ring</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Buy-in Amount (ETH)</label>
              <input
                type="number"
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 text-white"
                placeholder="0.001"
                step="0.001"
                min="0.001"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Max Players</label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 text-white"
                min="2"
                max="10"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateRing}
              disabled={isLoading || isWriting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium flex items-center"
            >
              {(isLoading || isWriting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Ring
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Ring Display */}
      {activeRing && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-xl border border-green-400/40 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl text-white font-bold">Ring #{activeRing.id}</h3>
            <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${
              activeRing.isActive ? 'bg-green-500 text-black' : 'bg-gray-500 text-white'
            }`}>
              {activeRing.isActive ? 'ACTIVE' : 'FINISHED'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-3xl font-bold text-green-400">{activeRing.totalPot} ETH</div>
              <div className="text-gray-400">Total Pot</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{activeRing.participants.length}/{activeRing.maxPlayers}</div>
              <div className="text-gray-400">Players</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{activeRing.buyIn} ETH</div>
              <div className="text-gray-400">Buy-in</div>
            </div>
          </div>
        </div>
      )}

      {/* Rings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rings.map(ring => (
          <div
            key={ring.id}
            className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
              activeRing?.id === ring.id ? 'border-green-400/60' : 'border-gray-700/50'
            }`}
            onClick={() => selectRing(ring)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Ring #{ring.id}</h3>
              <div className={`px-3 py-2 rounded-2xl text-xs font-bold ${
                ring.isActive ? 'bg-green-500 text-black' : 'bg-gray-500 text-white'
              }`}>
                {ring.isActive ? 'ACTIVE' : 'FINISHED'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{ring.totalPot} ETH</div>
                <div className="text-xs text-gray-400">Total Pot</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{ring.participants.length}/{ring.maxPlayers}</div>
                <div className="text-xs text-gray-400">Players</div>
              </div>
            </div>

            {/* Action Buttons */}
            {ring.isActive && address && !ring.participants.includes(address) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinRing(ring.id, ring.buyIn);
                }}
                disabled={isLoading || isWriting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center"
              >
                {(isLoading || isWriting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Join Ring ({ring.buyIn} ETH)
              </button>
            )}

            {ring.isActive && ring.participants.includes(address || '') && (
              <div className="text-center text-green-400 font-medium bg-green-400/10 rounded-2xl py-2">
                You're in this ring!
              </div>
            )}

            {!ring.isActive && (
              <div className="text-center text-gray-400 font-medium bg-gray-400/10 rounded-2xl py-2">
                <Trophy className="w-4 h-4 inline mr-1" />
                Ring Finished
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-3" />
            <p className="text-white">Processing transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
}
