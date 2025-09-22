'use client';

import { Users, Trophy, Clock, Play } from 'lucide-react';

interface MobileRingCardProps {
  ring: any;
  onJoin: () => void;
  onStart: () => void;
  isJoining: boolean;
  canJoin: boolean;
  canStart: boolean;
  userInRing: boolean;
}

export default function MobileRingCard({
  ring,
  onJoin,
  onStart,
  isJoining,
  canJoin,
  canStart,
  userInRing
}: MobileRingCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-xl">
      {/* Ring Status */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Ring #{ring.id.slice(-6)}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              ring.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
              ring.status === 'spinning' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {ring.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">${ring.buy_in}</div>
          <div className="text-xs text-gray-400">Buy-in</div>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {ring.participants?.length || 0}/{ring.max_players} Players
          </span>
        </div>
        
        {/* Player Avatars */}
        <div className="flex -space-x-2">
          {ring.participants?.slice(0, 5).map((p: any, i: number) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900"
              style={{ backgroundColor: p.color }}
            >
              {p.avatar}
            </div>
          ))}
          {ring.participants?.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 border-2 border-gray-900">
              +{ring.participants.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canJoin && (
          <button
            onClick={onJoin}
            disabled={isJoining}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Join Ring</span>
          </button>
        )}
        
        {userInRing && !canStart && (
          <div className="flex-1 bg-gray-700/50 text-gray-400 py-3 rounded-xl font-semibold text-center">
            You're in! ✅
          </div>
        )}
        
        {canStart && (
          <button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Start Spin! 🎰
          </button>
        )}
      </div>

      {/* Total Pot */}
      {ring.total_pot > 0 && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-400">Total Pot</div>
          <div className="text-xl font-bold text-yellow-400">${ring.total_pot}</div>
        </div>
      )}
    </div>
  );
}
