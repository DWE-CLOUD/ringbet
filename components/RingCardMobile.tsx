'use client';

import { Users, TrendingUp, Timer, Zap } from 'lucide-react';
import { useState } from 'react';

interface RingCardMobileProps {
  ring: any;
  onJoin: () => void;
  onStart: () => void;
  isJoining: boolean;
  canJoin: boolean;
  canStart: boolean;
  userInRing: boolean;
}

export default function RingCardMobile({
  ring,
  onJoin,
  onStart,
  isJoining,
  canJoin,
  canStart,
  userInRing
}: RingCardMobileProps) {
  const [isPressed, setIsPressed] = useState(false);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'waiting': return 'bg-blue-500';
      case 'spinning': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 border border-gray-800 shadow-2xl transition-all hover:shadow-green-500/10 hover:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white">Ring #{ring.id.slice(-6)}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(ring.status)} animate-pulse`} />
              <span className="text-xs text-gray-400 uppercase tracking-wide">{ring.status}</span>
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
          <span className="text-xs text-blue-400 uppercase tracking-wide font-medium">WAITING</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
          <div className="text-green-400 text-xl font-bold">
            {ring.buy_in ? `${ring.buy_in}` : '0.0001'}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">ETH Buy-in</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
          <div className="text-purple-400 text-xl font-bold">
            {ring.participants?.length || 1}/{ring.max_players || 4}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Players</div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-3 text-center">
          <div className="text-yellow-400 text-xl font-bold">
            {ring.total_pot || ring.buy_in || '0.0001'}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Total Pot</div>
        </div>
      </div>

      {/* Participants Section */}
      <div className="mb-5">
        <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Players in Ring:</div>
        <div className="flex flex-wrap gap-2">
          {ring.participants?.map((p: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1.5"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: p.color || '#10b981' }}
              >
                {p.avatar || '👑'}
              </div>
              <span className="text-xs text-gray-300">{formatAddress(p.player_address)}</span>
            </div>
          )) || (
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
                👑
              </div>
              <span className="text-xs text-gray-300">0x7b54...D79A</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {userInRing ? (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold">You are in this ring!</span>
          </div>
        </div>
      ) : canJoin ? (
        <button
          onClick={onJoin}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          disabled={isJoining}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform ${
            isPressed ? 'scale-95' : 'scale-100'
          } ${
            isJoining 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 shadow-lg shadow-green-500/25'
          }`}
        >
          {isJoining ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Join Ring</span>
            </div>
          )}
        </button>
      ) : canStart ? (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-yellow-500/25"
        >
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Start Spin!</span>
          </div>
        </button>
      ) : null}
    </div>
  );
}
