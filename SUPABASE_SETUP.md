# Supabase Setup Guide for RingBet

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to initialize

## 2. Get API Keys

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the **Project URL** and **anon/public key**
3. Add them to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these queries:

```sql
-- Create rings table
CREATE TABLE rings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_address TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  buy_in DECIMAL(18, 8) NOT NULL,
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  total_pot DECIMAL(18, 8) DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'spinning', 'finished')),
  winner_address TEXT,
  winner_name TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ring_participants table
CREATE TABLE ring_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ring_id UUID REFERENCES rings(id) ON DELETE CASCADE,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  tx_hash TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ring_id, player_address) -- Prevent duplicate joins
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ring_id UUID REFERENCES rings(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_rings_status ON rings(status);
CREATE INDEX idx_rings_created_at ON rings(created_at DESC);
CREATE INDEX idx_participants_ring_id ON ring_participants(ring_id);
CREATE INDEX idx_participants_address ON ring_participants(player_address);
CREATE INDEX idx_messages_ring_id ON chat_messages(ring_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ring_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make these more restrictive later)

-- Rings policies
CREATE POLICY "Anyone can view rings" ON rings 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create rings" ON rings 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update rings" ON rings 
  FOR UPDATE USING (true);

-- Participants policies  
CREATE POLICY "Anyone can view participants" ON ring_participants 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join rings" ON ring_participants 
  FOR INSERT WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Anyone can view messages" ON chat_messages 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can send messages" ON chat_messages 
  FOR INSERT WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rings;
ALTER PUBLICATION supabase_realtime ADD TABLE ring_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for rings table
CREATE TRIGGER update_rings_updated_at BEFORE UPDATE ON rings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Test the Setup

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Connect your wallet (MetaMask or similar)
4. Create a ring and test the functionality

## Features Implemented

- ✅ **Wallet Payments**: Real ETH transactions for creating/joining rings
- ✅ **Real-time Updates**: Live updates when rings change
- ✅ **Real-time Chat**: Global and ring-specific chat rooms
- ✅ **Participant Tracking**: See who's in each ring
- ✅ **Winner Selection**: Random winner selection after spin
- ✅ **Transaction History**: Stores tx hashes for all payments

## Security Notes

For production, you should:

1. Implement proper RLS policies based on user authentication
2. Add wallet signature verification
3. Use a proper treasury contract for handling funds
4. Add rate limiting for chat messages
5. Implement proper payout mechanisms for winners
