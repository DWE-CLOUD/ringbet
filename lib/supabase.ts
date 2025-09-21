import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
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
}

export interface RingParticipant {
  id: string
  ring_id: string
  player_address: string
  player_name: string
  avatar: string
  color: string
  joined_at: string
}

// Database functions
export const ringService = {
  // Get all rings
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

  // Create a new ring
  async createRing(ringData: Omit<Ring, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('rings')
      .insert([ringData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Join a ring
  async joinRing(ringId: string, participant: Omit<RingParticipant, 'id' | 'joined_at'>) {
    // Add participant
    const { data: participantData, error: participantError } = await supabase
      .from('ring_participants')
      .insert([{ ...participant, ring_id: ringId }])
      .select()
      .single()
    
    if (participantError) throw participantError

    // Update ring player count and pot
    const { data: ringData, error: ringError } = await supabase
      .from('rings')
      .select('current_players, buy_in')
      .eq('id', ringId)
      .single()
    
    if (ringError) throw ringError

    const newPlayerCount = ringData.current_players + 1
    const newTotalPot = ringData.buy_in * newPlayerCount

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

  // Declare winner
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

  // Get ring participants
  async getRingParticipants(ringId: string) {
    const { data, error } = await supabase
      .from('ring_participants')
      .select('*')
      .eq('ring_id', ringId)
      .order('joined_at', { ascending: true })
    
    if (error) throw error
    return data
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
  }
}
