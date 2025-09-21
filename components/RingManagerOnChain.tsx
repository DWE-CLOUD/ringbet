"use client";

import { useState } from 'react';
import { Users, Trophy, Plus, Loader2, RefreshCw } from 'lucide-react';
import { useRingsContract } from '@/hooks/useRingsContract';
import { useRings } from '@/hooks/useRings';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

interface RingManagerProps {
  onRingChange?: (ring: any) => void;
}

export default function RingManagerOnChain({ onRingChange }: RingManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [buyInAmount, setBuyInAmount] = useState('0.0001');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRingId, setSelectedRingId] = useState<number | null>(null);
  
  const { address, isConnected } = useAccount();
  const { createRing, joinRing, isWriting } = useRingsContract();
  const { rings, isLoading, refetch } = useRings();

  const handleCreateRing = async () => {
    if (!buyInAmount || Number(buyInAmount) <= 0) return;
    
    setIsProcessing(true);
    try {
      // Convert ETH to wei for contract value parameter
      const buyInWei = parseEther(buyInAmount);
      
      // Pass the wei value as buyIn parameter
      await createRing(Number(buyInWei), maxPlayers);
      setShowCreateForm(false);
      setBuyInAmount('0.0001');
      setMaxPlayers(4);
      // Refetch rings after creation
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error('Error creating ring:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinRing = async (ringId: number, buyIn: string) => {
    setIsProcessing(true);
    setSelectedRingId(ringId);
    try {
      // Now joinRing accepts a string directly
      await joinRing(ringId, buyIn);
      // Refetch rings after joining
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error('Error joining ring:', error);
    } finally {
      setIsProcessing(false);
      setSelectedRingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">Betting Rings</h2>
          <button
            onClick={() => refetch()}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh rings"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!isConnected}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ring</span>
        </button>
      </div>

      {/* Wallet Connection Alert */}
      {!isConnected && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-300">
          Please connect your wallet to create or join rings
        </div>
      )}

      {/* Loading State or Empty State with Refresh */}
      {rings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          ) : (
            <>
              <p className="text-gray-400">No rings found. Try refreshing or create a new ring.</p>
              <button 
                onClick={() => {
                  refetch();
                  console.log('Manual refresh triggered');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Rings
              </button>
            </>
          )}
        </div>
      )}

      {/* Create Ring Form */}
      {showCreateForm && isConnected && (
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
                placeholder="0.0001"
                step="0.0001"
                min="0.0001"
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
              disabled={isProcessing || isWriting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium flex items-center"
            >
              {(isProcessing || isWriting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

      {/* Rings List */}
      {rings.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No rings available yet</p>
          <p className="text-gray-500">Create the first ring to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rings.map(ring => {
            const isUserInRing = address && ring.participants.some(
              p => p.toLowerCase() === address.toLowerCase()
            );
            const isProcessingThis = selectedRingId === ring.id && isProcessing;

            return (
              <div
                key={ring.id}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-green-500/50"
                onClick={() => onRingChange?.(ring)}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white">Ring #{ring.id}</h3>
                  <div className={`px-3 py-2 rounded-2xl text-xs font-bold ${
                    ring.isActive ? 'bg-green-500 text-black' : 'bg-gray-500 text-white'
                  }`}>
                    {ring.isActive ? 'ACTIVE' : 'FINISHED'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{ring.totalPot}</div>
                    <div className="text-xs text-gray-400">ETH Pot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{ring.participants.length}/{ring.maxPlayers}</div>
                    <div className="text-xs text-gray-400">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{ring.buyIn}</div>
                    <div className="text-xs text-gray-400">ETH Buy-in</div>
                  </div>
                </div>

                {/* Participants */}
                {ring.participants.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-800/40 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Players:</p>
                    <div className="flex flex-wrap gap-1">
                      {ring.participants.map((participant, idx) => (
                        <span key={idx} className="text-xs bg-gray-700/60 px-2 py-1 rounded-lg text-gray-300">
                          {participant.slice(0, 6)}...{participant.slice(-4)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {ring.isActive && isConnected && !isUserInRing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinRing(ring.id, ring.buyIn);
                    }}
                    disabled={isProcessing || isWriting}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center"
                  >
                    {isProcessingThis && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Join Ring ({ring.buyIn} ETH)
                  </button>
                )}

                {isUserInRing && (
                  <div className="text-center text-green-400 font-medium bg-green-400/10 rounded-2xl py-2">
                    <Users className="w-4 h-4 inline mr-1" />
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
            );
          })}
        </div>
      )}

      {/* Processing Overlay */}
      {(isProcessing || isWriting) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-3" />
            <p className="text-white">Processing transaction...</p>
            <p className="text-gray-400 text-sm mt-1">Please confirm in your wallet</p>
          </div>
        </div>
      )}
    </div>
  );
}
