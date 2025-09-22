'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Trophy, TrendingUp, Target, Wallet, Copy, CheckCircle, ExternalLink, Activity, Edit3, Twitter, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileService, UserProfile } from '@/lib/supabaseEnhanced';
import ProfileEditModal from './ProfileEditModal';

export default function ProfilePage() {
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

          // Update profile with latest stats
          await userProfileService.updateUserStats(address, { won: false, amount: 0 });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [address]);

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    if (!address || !profile) return;
    
    try {
      const updatedProfile = await userProfileService.updateProfile(address, updates);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black p-4 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-gray-700/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl">
            {user?.displayName?.[0] || address?.[2] || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">
                {profile?.display_name || 'Loading...'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-gray-400 hover:text-green-400 transition-colors p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            {profile?.bio && (
              <p className="text-gray-400 text-sm mb-2">{profile.bio}</p>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-gray-800 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
              {stats.rank > 0 && (
                <div className="bg-yellow-500/20 rounded-full px-3 py-1">
                  <span className="text-xs text-yellow-400">Rank #{stats.rank}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(profile?.twitter_handle || profile?.discord_handle || profile?.telegram_handle) && (
          <div className="flex gap-2 mb-4">
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors"
              >
                <Twitter className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">@{profile.twitter_handle}</span>
              </a>
            )}
            {profile.discord_handle && (
              <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <MessageCircle className="w-3 h-3 text-indigo-400" />
                <span className="text-xs text-indigo-400">{profile.discord_handle}</span>
              </div>
            )}
            {profile.telegram_handle && (
              <a
                href={`https://t.me/${profile.telegram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors"
              >
                <Send className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-500">@{profile.telegram_handle}</span>
              </a>
            )}
          </div>
        )}

        {/* Wallet Section */}
        <div className="bg-gray-800/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Wallet Address</span>
            </div>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg px-3 py-1 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-white text-sm mb-3">{formatAddress(address)}</div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Balance</span>
            <span className="text-green-400 font-bold text-lg">
              {formatEth(balance.data?.value)} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 uppercase tracking-wide">Total Won</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalWon}</div>
          <div className="text-xs text-gray-400 mt-1">Games</div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 uppercase tracking-wide">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
          <div className="text-xs text-gray-400 mt-1">Success</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400 uppercase tracking-wide">Total Bets</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
          <div className="text-xs text-gray-400 mt-1">Lifetime</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 uppercase tracking-wide">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
          <div className="text-xs text-gray-400 mt-1">Current</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Detailed Statistics</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400 text-sm">Total Volume</span>
            <span className="text-white font-semibold">{stats.totalVolume} ETH</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400 text-sm">Biggest Win</span>
            <span className="text-green-400 font-semibold">{stats.biggestWin} ETH</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400 text-sm">Games Won</span>
            <span className="text-white font-semibold">{stats.totalWon}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400 text-sm">Games Lost</span>
            <span className="text-white font-semibold">{stats.totalLost}</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-400 text-sm">Member Since</span>
            <span className="text-white font-semibold">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              }) : 'Recently'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2">
          <Activity className="w-4 h-4" />
          <span>Game History</span>
        </button>
        <button 
          onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View on Explorer</span>
        </button>
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
