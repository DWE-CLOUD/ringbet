'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ArrowLeft, Trophy, TrendingUp, Target, Wallet, Settings, LogOut, Star, Zap, Crown, Gamepad2, Users, Clover, Edit3, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileService, UserProfile } from '@/lib/supabaseEnhanced';
import ProfileEditModal from './ProfileEditModal';

interface ProfilePageProps {
  onBackToDashboard?: () => void;
}

export default function ProfilePage({ onBackToDashboard }: ProfilePageProps) {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWon: 0,
    totalLost: 0,
    winRate: 0,
    biggestWin: 0,
    currentStreak: 0,
    totalVolume: 0,
    rank: 0
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const balance = useBalance({
    address: address,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleEditName = () => {
    setEditedName(profile?.display_name || formatAddress(address) || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!address || !editedName.trim()) return;
    
    try {
      await handleSaveProfile({ display_name: editedName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const formatEth = (value: bigint | undefined) => {
    if (!value) return '0.00';
    return (Number(value) / 1e18).toFixed(4);
  };

  // Load real user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        // Get or create user profile
        const userProfile = await userProfileService.getOrCreateProfile(address);
        setProfile(userProfile);

        // Get real-time stats
        const realStats = await userProfileService.getUserStats(address);
        if (realStats) {
          setStats({
            totalBets: realStats.totalGames,
            totalWon: realStats.totalWins,
            totalLost: realStats.totalLosses,
            winRate: realStats.winRate,
            biggestWin: realStats.biggestWin,
            currentStreak: realStats.currentStreak,
            totalVolume: realStats.totalVolume,
            rank: userProfile.rank || 0
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Create a default profile if loading fails
        setProfile({
          id: '',
          wallet_address: address,
          display_name: formatAddress(address),
          total_games: 1,
          total_wins: 0,
          total_losses: 1,
          total_volume: 0,
          biggest_win: 0,
          current_streak: 0,
          best_streak: 0,
          rank: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [address]);

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    if (!address) return;
    
    try {
      // If no profile exists, create one first
      if (!profile) {
        const newProfile = await userProfileService.getOrCreateProfile(address);
        setProfile(newProfile);
      }
      
      const updatedProfile = await userProfileService.updateProfile(address, updates);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Update local state even if server update fails
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    }
  };

  // Achievement data
  const achievements = [
    {
      id: 'first_win',
      title: 'First Win',
      description: 'Win your first game',
      icon: Trophy,
      earned: stats.totalWon > 0,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-900/20 to-orange-900/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Win over $1,000 total',
      icon: Crown,
      earned: stats.totalVolume > 1000,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-900/20 to-pink-900/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Win 5 games in a row',
      icon: Zap,
      earned: stats.currentStreak >= 5,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-900/20 to-cyan-900/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'ring_creator',
      title: 'Ring Creator',
      description: 'Create your first ring',
      icon: Target,
      earned: true, // Assume earned for demo
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-900/20 to-emerald-900/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'social_player',
      title: 'Social Player',
      description: 'Play 10 games',
      icon: Users,
      earned: stats.totalBets >= 10,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-900/20 to-purple-900/10',
      borderColor: 'border-indigo-500/30'
    },
    {
      id: 'lucky_charm',
      title: 'Lucky Charm',
      description: 'Win with lowest bet in ring',
      icon: Clover,
      earned: false, // Not earned yet
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-900/20 to-green-900/10',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Back to Dashboard */}
      <div className="p-4 md:p-6">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl flex-shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() || address?.[2]?.toUpperCase() || 'U'}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none focus:border-green-400 flex-1"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveName}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">
                      {profile?.display_name || formatAddress(address) || 'Loading...'}
                    </h1>
                    <button 
                      onClick={handleEditName}
                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                  <span className="text-xs text-yellow-400 font-semibold">🏆 Level 1</span>
                </div>
                <span className="text-gray-400 text-sm">
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit',
                    year: 'numeric' 
                  }) : '09/22/2025'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Balance */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-green-400 text-xl">💰</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${formatEth(balance.data?.value) ? (parseFloat(formatEth(balance.data?.value)) * 2500).toFixed(0) : '4,700'}
            </div>
            <div className="text-xs text-gray-400">Balance</div>
          </div>

          {/* Total Won */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-400 text-xl">🏆</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">${stats.totalWon || 0}</div>
            <div className="text-xs text-gray-400">Total Won</div>
          </div>

          {/* Games Played */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-400 text-xl">🎯</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalBets || 1}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>

          {/* Win Rate */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 text-xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.winRate || 0.0}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Achievements</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative bg-gradient-to-br ${achievement.bgColor} border ${achievement.borderColor} rounded-2xl p-4 transition-all duration-300 ${
                    achievement.earned ? 'hover:scale-105 shadow-lg' : 'opacity-60'
                  }`}
                >
                  {achievement.earned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-black fill-current" />
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 bg-gradient-to-r ${achievement.color} rounded-xl flex items-center justify-center mb-3 ${achievement.earned ? '' : 'grayscale'}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 border border-gray-600/50 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3">
            <Settings className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Account Settings</div>
              <div className="text-xs text-gray-400">Manage your preferences and privacy</div>
            </div>
          </button>
          
          <button className="bg-gradient-to-r from-red-600/50 to-red-700/50 hover:from-red-500/50 hover:to-red-600/50 border border-red-500/50 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3">
            <LogOut className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Sign Out</div>
              <div className="text-xs text-gray-400">Log out of your account</div>
            </div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-gray-900 rounded-2xl p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
            <span className="text-white">Loading profile...</span>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
