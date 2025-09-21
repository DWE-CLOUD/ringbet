"use client";

import { useState, useEffect } from 'react';
import { Users, Trophy, Plus, Loader2, RefreshCw, Play, Wallet } from 'lucide-react';
import { ringService, Ring, RingParticipant } from '@/lib/supabase';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface RingManagerProps {
  onRingChange?: (ring: Ring & { participants: RingParticipant[] }) => void;
}

const AVATAR_EMOJIS = ['🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺', '🎻'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

export default function RingManagerSupabase({ onRingChange }: RingManagerProps) {
  const [rings, setRings] = useState<(Ring & { participants: RingParticipant[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [buyInAmount, setBuyInAmount] = useState(0.001); // ETH amount
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRingCreation, setPendingRingCreation] = useState<any>(null);
  const [pendingRingJoin, setPendingRingJoin] = useState<any>(null);
  
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Load rings from Supabase
  const loadRings = async () => {
    try {
      setIsLoading(true);
      const data = await ringService.getAllRings();
      setRings(data || []);
    } catch (error) {
      console.error('Error loading rings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRings();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const subscription = ringService.subscribeToRings(() => {
      loadRings(); // Reload when changes occur
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle transaction confirmation for ring creation
  useEffect(() => {
    if (isConfirmed && pendingRingCreation) {
      // Transaction confirmed, now create ring in database
      const createRingInDB = async () => {
        try {
          await ringService.createRing({
            creator_address: address!,
            creator_name: `${address!.slice(0, 6)}...${address!.slice(-4)}`,
            buy_in: pendingRingCreation.buyIn,
            max_players: pendingRingCreation.maxPlayers,
            current_players: 1, // Creator automatically joins
            total_pot: pendingRingCreation.buyIn,
            status: 'waiting'
          });

          // Add creator as first participant
          const randomAvatar = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
          const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          
          // Note: We'll need to get the ring ID first, so let's modify this
          loadRings();
          setShowCreateForm(false);
          setBuyInAmount(0.001);
          setMaxPlayers(4);
        } catch (error) {
          console.error('Error creating ring in DB:', error);
        } finally {
          setPendingRingCreation(null);
          setIsProcessing(false);
        }
      };
      
      createRingInDB();
    }
  }, [isConfirmed, pendingRingCreation, address]);

  // Handle transaction confirmation for joining ring
  useEffect(() => {
    if (isConfirmed && pendingRingJoin) {
      const joinRingInDB = async () => {
        try {
          const randomAvatar = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
          const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          
          await ringService.joinRing(pendingRingJoin.ringId, {
            player_address: address!,
            player_name: `${address!.slice(0, 6)}...${address!.slice(-4)}`,
            avatar: randomAvatar,
            color: randomColor
          });

          loadRings();
        } catch (error) {
          console.error('Error joining ring in DB:', error);
        } finally {
          setPendingRingJoin(null);
          setIsProcessing(false);
        }
      };
      
      joinRingInDB();
    }
  }, [isConfirmed, pendingRingJoin, address]);

  const handleCreateRing = async () => {
    if (!address || !isConnected) return;
    
    setIsProcessing(true);
    try {
      // Send ETH transaction first
      setPendingRingCreation({ buyIn: buyInAmount, maxPlayers });
      
      await sendTransaction({
        to: address, // Send to self as a deposit
        value: parseEther(buyInAmount.toString()),
      });
      
      // Transaction sent, waiting for confirmation...
    } catch (error) {
      console.error('Error sending transaction:', error);
      setIsProcessing(false);
      setPendingRingCreation(null);
    }
  };

  const handleJoinRing = async (ring: Ring) => {
    if (!address || !isConnected) return;
    
    setIsProcessing(true);
    try {
      // Send ETH transaction first
      setPendingRingJoin({ ringId: ring.id, buyIn: ring.buy_in });
      
      await sendTransaction({
        to: address, // Send to self as a deposit
        value: parseEther((ring.buy_in / 1000).toString()), // Convert from dollars to ETH (rough conversion)
      });
      
      // Transaction sent, waiting for confirmation...
    } catch (error) {
      console.error('Error sending transaction:', error);
      setIsProcessing(false);
      setPendingRingJoin(null);
    }
  };

  const handleStartSpin = async (ring: Ring & { participants: RingParticipant[] }) => {
    if (ring.current_players < 2) return;
    
    try {
      await ringService.startSpinning(ring.id);
      loadRings();
      
      // Auto-select winner after 3 seconds (simulate spin)
      setTimeout(async () => {
        const randomWinner = ring.participants[Math.floor(Math.random() * ring.participants.length)];
        await ringService.declareWinner(ring.id, randomWinner.player_address, randomWinner.player_name);
        loadRings();
      }, 3000);
    } catch (error) {
      console.error('Error starting spin:', error);
    }
  };

  const isUserInRing = (ring: Ring & { participants: RingParticipant[] }) => {
    return ring.participants.some(p => p.player_address.toLowerCase() === address?.toLowerCase());
  };

  const canUserStartSpin = (ring: Ring & { participants: RingParticipant[] }) => {
    return ring.creator_address.toLowerCase() === address?.toLowerCase() && 
           ring.current_players >= 2 && 
           ring.status === 'active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">Live Betting Rings</h2>
          <button
            onClick={loadRings}
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
                onChange={(e) => setBuyInAmount(Number(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-4 py-3 text-white"
                placeholder="0.001"
                min="0.001"
                step="0.001"
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
                max="8"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateRing}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 font-medium flex items-center"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

      {/* No Rings State */}
      {!isLoading && rings.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Live Bets</h3>
          <p className="text-gray-400 mb-6">Be the first to create a betting ring!</p>
          {isConnected && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Create First Ring
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      )}

      {/* Rings Grid */}
      {rings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rings.map(ring => {
            const userInRing = isUserInRing(ring);
            const canStart = canUserStartSpin(ring);
            
            return (
              <div
                key={ring.id}
                className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  ring.status === 'spinning' ? 'border-yellow-400/60 animate-pulse' : 
                  ring.status === 'finished' ? 'border-gray-600/50' : 'border-gray-700/50 hover:border-green-500/50'
                }`}
                onClick={() => onRingChange?.(ring)}
              >
                {/* Ring Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Ring #{ring.id.slice(-6)}</h3>
                  <div className={`px-3 py-2 rounded-2xl text-xs font-bold ${
                    ring.status === 'waiting' ? 'bg-blue-500 text-white' :
                    ring.status === 'active' ? 'bg-green-500 text-black' :
                    ring.status === 'spinning' ? 'bg-yellow-500 text-black animate-pulse' :
                    'bg-gray-500 text-white'
                  }`}>
                    {ring.status.toUpperCase()}
                  </div>
                </div>

                {/* Ring Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{ring.total_pot} ETH</div>
                    <div className="text-xs text-gray-400">Total Pot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{ring.current_players}/{ring.max_players}</div>
                    <div className="text-xs text-gray-400">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{ring.buy_in} ETH</div>
                    <div className="text-xs text-gray-400">Buy-in</div>
                  </div>
                </div>

                {/* Participants Preview */}
                {ring.participants && ring.participants.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {ring.participants.slice(0, 4).map((participant, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-800/40 rounded-lg px-3 py-1"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                            style={{ backgroundColor: participant.color }}
                          >
                            {participant.avatar}
                          </div>
                          <span className="text-xs text-gray-300">{participant.player_name}</span>
                        </div>
                      ))}
                      {ring.participants.length > 4 && (
                        <div className="text-xs text-gray-400 px-2 py-1">
                          +{ring.participants.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Winner Display */}
                {ring.status === 'finished' && ring.winner_name && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-center">
                    <Trophy className="w-5 h-5 inline mr-2 text-yellow-400" />
                    <span className="text-yellow-300 font-bold">{ring.winner_name} won ${ring.total_pot}!</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {ring.status === 'waiting' && !userInRing && isConnected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRing(ring);
                      }}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center"
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Join Ring (${ring.buy_in})
                    </button>
                  )}

                  {userInRing && ring.status !== 'finished' && (
                    <div className="text-center text-green-400 font-medium bg-green-400/10 rounded-2xl py-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      You're in this ring!
                    </div>
                  )}

                  {canStart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSpin(ring);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Spin!
                    </button>
                  )}

                  {ring.status === 'spinning' && (
                    <div className="text-center text-yellow-400 font-medium bg-yellow-400/10 rounded-2xl py-2 animate-pulse">
                      🎯 Spinning now! Winner incoming...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-3" />
            <p className="text-white">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
