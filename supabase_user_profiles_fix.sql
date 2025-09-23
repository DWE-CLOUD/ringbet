-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar TEXT,
  twitter_handle TEXT,
  discord_handle TEXT,
  telegram_handle TEXT,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_volume DECIMAL(18, 8) DEFAULT 0,
  biggest_win DECIMAL(18, 8) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_rank ON user_profiles(rank DESC);
CREATE INDEX idx_user_profiles_total_volume ON user_profiles(total_volume DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Anyone can view profiles" ON user_profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON user_profiles 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (true);

-- Enable realtime for user_profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Create trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add demo mode support to rings table
ALTER TABLE rings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add demo mode support to user_profiles table  
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS demo_games INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS demo_wins INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS demo_losses INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS demo_volume DECIMAL(18, 8) DEFAULT 0;

-- Insert some sample data for testing
INSERT INTO user_profiles (wallet_address, display_name, total_games, total_wins, total_losses, total_volume, biggest_win, current_streak, best_streak, rank)
VALUES 
  ('0x7b54b0d444aae2717f05589212928e1e108fd79a', 'akshit', 1, 0, 1, 0.00001, 0, 0, 0, 1),
  ('0x1234567890123456789012345678901234567890', 'Player2', 5, 3, 2, 0.05, 0.02, 2, 3, 2),
  ('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'Player3', 10, 7, 3, 0.15, 0.08, 1, 5, 3)
ON CONFLICT (wallet_address) DO NOTHING;
