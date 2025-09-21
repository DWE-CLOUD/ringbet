"use client";

import { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Crown, Star, Heart, MessageCircle, Share } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar: string;
  wins: number;
  streak: number;
  vibe: string;
  lastWin: string;
  amount: number;
  status: 'fire' | 'cold' | 'normal';
  followers: number;
  isVerified: boolean;
  mood: string;
  country: string;
}

export default function Leaderboard() {
  const [filter, setFilter] = useState<'hot' | 'rich' | 'lucky'>('hot');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const mockPlayers: Player[] = [
      {
        id: '1',
        username: 'xX_SpinLord_Xx',
        avatar: 'SL',
        wins: 42,
        streak: 8,
        vibe: 'absolutely crushing it rn 🔥',
        lastWin: '2m ago',
        amount: 15420,
        status: 'fire',
        followers: 1247,
        isVerified: true,
        mood: '🚀',
        country: '🇺🇸'
      },
      {
        id: '2', 
        username: 'casino_queen',
        avatar: 'CQ',
        wins: 38,
        streak: 12,
        vibe: 'luck is my middle name ✨',
        lastWin: '5m ago',
        amount: 12890,
        status: 'fire',
        followers: 892,
        isVerified: true,
        mood: '✨',
        country: '🇬🇧'
      },
      {
        id: '3',
        username: 'WheelGod',
        avatar: 'WG',
        wins: 29,
        streak: 3,
        vibe: 'back from the dead 💀→🔥',
        lastWin: '12m ago',
        amount: 9870,
        status: 'normal',
        followers: 634,
        isVerified: false,
        mood: '😤',
        country: '🇩🇪'
      },
      {
        id: '4',
        username: 'LuckyAF',
        avatar: 'LA',
        wins: 51,
        streak: 1,
        vibe: 'grinding every day 💪',
        lastWin: '18m ago',
        amount: 18650,
        status: 'normal',
        followers: 456,
        isVerified: false,
        mood: '💪',
        country: '🇨🇦'
      },
      {
        id: '5',
        username: 'spin_dealer',
        avatar: 'SD',
        wins: 33,
        streak: 5,
        vibe: 'house always wins... except when I play 😎',
        lastWin: '25m ago',
        amount: 11200,
        status: 'normal',
        followers: 789,
        isVerified: true,
        mood: '😎',
        country: '🇫🇷'
      }
    ];
    setPlayers(mockPlayers);
  }, [filter]);

  const getStatusStyle = (status: string, streak: number) => {
    if (status === 'fire' || streak >= 5) {
      return {
        border: 'border-orange-400/60',
        bg: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
        glow: 'shadow-orange-500/30'
      };
    }
    return {
      border: 'border-gray-700/50',
      bg: 'bg-gray-900/60',
      glow: 'shadow-gray-900/20'
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Casual Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Who's Winning?
          </h1>
          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" style={{animationDelay: '0.5s'}} />
        </div>
        <p className="text-gray-400 text-lg">the players absolutely destroying it today</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-full p-2 flex space-x-2">
          <button
            onClick={() => setFilter('hot')}
            className={`px-6 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${
              filter === 'hot' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>🔥 HOT</span>
          </button>
          <button
            onClick={() => setFilter('rich')}
            className={`px-6 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${
              filter === 'rich' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>💰 RICH</span>
          </button>
          <button
            onClick={() => setFilter('lucky')}
            className={`px-6 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${
              filter === 'lucky' 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ LUCKY</span>
          </button>
        </div>
      </div>

      {/* Social Feed Style Players */}
      <div className="space-y-6">
        {players.map((player, index) => {
          const style = getStatusStyle(player.status, player.streak);
          const isTop3 = index < 3;
          
          return (
            <div
              key={player.id}
              className={`${style.bg} backdrop-blur-xl ${style.border} rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:${style.glow} ${
                isTop3 ? 'shadow-2xl ring-2 ring-yellow-400/30' : 'shadow-xl'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                    'bg-gray-700 text-white'
                  }`}>
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  
                  {/* Player Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold text-lg">{player.username}</span>
                      {player.isVerified && <div className="text-blue-400">✓</div>}
                      <span className="text-lg">{player.country}</span>
                      <span className="text-xl">{player.mood}</span>
                    </div>
                    <div className="text-gray-400 text-sm">{player.followers.toLocaleString()} followers</div>
                  </div>
                </div>
                
                {/* Time */}
                <div className="text-gray-500 text-sm">{player.lastWin}</div>
              </div>

              {/* Player Vibe/Status */}
              <div className="mb-4">
                <p className="text-gray-300 text-lg font-medium">"{player.vibe}"</p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">${player.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{player.wins}</div>
                    <div className="text-xs text-gray-500">games</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${player.streak >= 5 ? 'text-orange-400' : 'text-purple-400'}`}>
                      {player.streak}x {player.streak >= 5 && '🔥'}
                    </div>
                    <div className="text-xs text-gray-500">streak</div>
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform hover:scale-110 ${
                      player.streak >= 5 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                    }`}
                  >
                    {player.avatar}
                  </div>
                  {player.streak >= 5 && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🔥</div>
                  )}
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                <div className="flex space-x-6">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-sm">share</span>
                  </button>
                </div>
                
                {player.streak >= 5 && (
                  <div className="bg-orange-500/20 border border-orange-400/50 rounded-full px-3 py-1 animate-pulse">
                    <span className="text-orange-400 text-xs font-bold">ON FIRE 🔥</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Casual Footer */}
      <div className="text-center mt-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
        <div className="text-gray-400">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>live updates • refreshing every 30s</span>
          </div>
          <div className="text-sm">think you can do better? hop in a ring and prove it 😤</div>
        </div>
      </div>
    </div>
  );
}