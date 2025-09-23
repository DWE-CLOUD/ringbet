import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced Database types with wallet transactions
export interface Ring {
  id: string
  creator_address: string
  creator_name: string
  buy_in: number
  max_players: number
  current_players: number
  total_pot: number
  status: 'waiting' | 'active' | 'spinning' | 'finished'
  winner_address?: string
  winner_name?: string
  created_at: string
  updated_at: string
  tx_hash?: string // Transaction hash for creation
  is_demo?: boolean // Demo mode flag
}

export interface RingParticipant {
  id: string
  ring_id: string
  player_address: string
  player_name: string
  avatar: string
  color: string
  joined_at: string
  tx_hash?: string // Transaction hash for joining
}

export interface ChatMessage {
  id: string
  ring_id?: string // Optional: for ring-specific chat
  user_address: string
  user_name: string
  message: string
  created_at: string
}

export interface UserProfile {
  id: string
  wallet_address: string
  display_name: string
  avatar_url?: string
  bio?: string
  twitter_handle?: string
  discord_handle?: string
  telegram_handle?: string
  total_games: number
  total_wins: number
  total_losses: number
  total_volume: number
  biggest_win: number
  current_streak: number
  best_streak: number
  rank: number
  created_at: string
  updated_at: string
}

// Enhanced Database functions
export const ringService = {
  // Get all rings with participants (filtered by demo mode)
  async getAllRings(isDemoMode: boolean = false) {
    const { data: rings, error } = await supabase
      .from('rings')
      .select(`
        *,
        participants:ring_participants(*)
      `)
      .eq('is_demo', isDemoMode)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return rings || []
  },

  // Get single ring with participants
  async getRing(ringId: string) {
    const { data, error } = await supabase
      .from('rings')
      .select(`
        *,
        participants:ring_participants(*)
      `)
      .eq('id', ringId)
      .single()
    
    if (error) throw error
    return data
  },

  // Create a new ring (after wallet payment)
  async createRing(ringData: Omit<Ring, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('rings')
      .insert([{
        ...ringData,
        current_players: 1, // Creator automatically joins
        total_pot: ringData.buy_in
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Auto-join creator as first participant
    if (data) {
      await this.addParticipant(data.id, {
        player_address: ringData.creator_address,
        player_name: ringData.creator_name,
        avatar: '👑',
        color: '#FFD700',
        tx_hash: ringData.tx_hash
      });
    }
    
    return data
  },

  // Add participant to ring
  async addParticipant(ringId: string, participant: Omit<RingParticipant, 'id' | 'joined_at' | 'ring_id'>) {
    const { data, error } = await supabase
      .from('ring_participants')
      .insert([{ ...participant, ring_id: ringId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Join a ring (after wallet payment)
  async joinRing(ringId: string, participant: Omit<RingParticipant, 'id' | 'joined_at' | 'ring_id'>, buyIn: number) {
    // Add participant
    const participantData = await this.addParticipant(ringId, participant);

    // Update ring player count and pot
    const { data: ringData, error: ringError } = await supabase
      .from('rings')
      .select('current_players, total_pot')
      .eq('id', ringId)
      .single()
    
    if (ringError) throw ringError

    const newPlayerCount = ringData.current_players + 1
    const newTotalPot = ringData.total_pot + buyIn

    const { error: updateError } = await supabase
      .from('rings')
      .update({ 
        current_players: newPlayerCount,
        total_pot: newTotalPot,
        status: newPlayerCount >= 2 ? 'active' : 'waiting'
      })
      .eq('id', ringId)
    
    if (updateError) throw updateError
    
    return participantData
  },

  // Start spinning
  async startSpinning(ringId: string) {
    const { error } = await supabase
      .from('rings')
      .update({ status: 'spinning' })
      .eq('id', ringId)
    
    if (error) throw error
  },

  // Declare winner and payout
  async declareWinner(ringId: string, winnerAddress: string, winnerName: string) {
    const { error } = await supabase
      .from('rings')
      .update({ 
        status: 'finished',
        winner_address: winnerAddress,
        winner_name: winnerName
      })
      .eq('id', ringId)
    
    if (error) throw error
  },

  // Subscribe to ring changes
  subscribeToRings(callback: (payload: any) => void) {
    return supabase
      .channel('rings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rings' }, 
        callback
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ring_participants' }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to specific ring updates
  subscribeToRing(ringId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`ring-${ringId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rings',
          filter: `id=eq.${ringId}`
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ring_participants',
          filter: `ring_id=eq.${ringId}`
        }, 
        callback
      )
      .subscribe()
  }
}

// Chat service
export const chatService = {
  // Get recent messages
  async getMessages(ringId?: string, limit: number = 50) {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (ringId) {
      query = query.eq('ring_id', ringId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data?.reverse() || [] // Reverse to show oldest first
  },

  // Send a message
  async sendMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Subscribe to new messages
  subscribeToMessages(callback: (message: ChatMessage) => void, ringId?: string) {
    const channel = supabase.channel('chat-messages')
    
    if (ringId) {
      channel.on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `ring_id=eq.${ringId}`
        }, 
        (payload) => callback(payload.new as ChatMessage)
      )
    } else {
      channel.on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages'
        }, 
        (payload) => callback(payload.new as ChatMessage)
      )
    }
    
    return channel.subscribe()
  }
}

// User Profile Service
export const userProfileService = {
  // Get or create user profile
  async getOrCreateProfile(walletAddress: string): Promise<UserProfile> {
    // First try to get existing profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Create new profile if doesn't exist
    const newProfile = {
      wallet_address: walletAddress.toLowerCase(),
      display_name: `Player ${walletAddress.slice(0, 6)}`,
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      total_volume: 0,
      biggest_win: 0,
      current_streak: 0,
      best_streak: 0,
      rank: 0
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update user profile
  async updateProfile(walletAddress: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress.toLowerCase())
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user stats from actual game data
  async getUserStats(walletAddress: string) {
    const address = walletAddress.toLowerCase()

    // Get total games participated
    const { data: participations } = await supabase
      .from('ring_participants')
      .select(`
        ring_id,
        rings!inner(
          status,
          winner_address,
          buy_in,
          total_pot
        )
      `)
      .eq('player_address', address)

    if (!participations) return null

    // Calculate stats
    const totalGames = participations.length
    const completedGames = participations.filter((p: any) => p.rings?.status === 'finished')
    const wins = completedGames.filter((p: any) => p.rings?.winner_address?.toLowerCase() === address)
    const losses = completedGames.filter((p: any) => p.rings?.winner_address?.toLowerCase() !== address)
    
    const totalWins = wins.length
    const totalLosses = losses.length
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0
    
    const totalVolume = participations.reduce((sum: number, p: any) => sum + (p.rings?.buy_in || 0), 0)
    const biggestWin = wins.length > 0 ? Math.max(...wins.map((w: any) => w.rings?.total_pot || 0)) : 0

    // Calculate current streak
    let currentStreak = 0
    const recentGames = completedGames.slice(-10).reverse() // Last 10 games, most recent first
    for (const game of recentGames) {
      if ((game as any).rings?.winner_address?.toLowerCase() === address) {
        currentStreak++
      } else {
        break
      }
    }

    return {
      totalGames,
      totalWins,
      totalLosses,
      winRate: Math.round(winRate * 100) / 100,
      totalVolume,
      biggestWin,
      currentStreak
    }
  },

  // Update user stats after a game
  async updateUserStats(walletAddress: string, gameResult: { won: boolean, amount: number }) {
    const stats = await this.getUserStats(walletAddress)
    if (!stats) return

    const profile = await this.getOrCreateProfile(walletAddress)
    
    const updates = {
      total_games: stats.totalGames,
      total_wins: stats.totalWins,
      total_losses: stats.totalLosses,
      total_volume: stats.totalVolume,
      biggest_win: stats.biggestWin,
      current_streak: stats.currentStreak,
      best_streak: Math.max(profile.best_streak, stats.currentStreak)
    }

    return this.updateProfile(walletAddress, updates)
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 50) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('total_wins', { ascending: false })
      .order('total_volume', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}
