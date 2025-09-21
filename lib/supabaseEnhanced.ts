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

// Enhanced Database functions
export const ringService = {
  // Get all rings with participants
  async getAllRings() {
    const { data, error } = await supabase
      .from('rings')
      .select(`
        *,
        participants:ring_participants(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
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
