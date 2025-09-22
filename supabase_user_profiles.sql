-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    twitter_handle TEXT,
    discord_handle TEXT,
    telegram_handle TEXT,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_volume DECIMAL DEFAULT 0,
    biggest_win DECIMAL DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);

-- Create index on rank for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_rank ON user_profiles(rank DESC);

-- Create index on total_wins for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_wins ON user_profiles(total_wins DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all profiles (for leaderboard)
CREATE POLICY "Allow read access to all user profiles" ON user_profiles
    FOR SELECT USING (true);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON user_profiles
    FOR UPDATE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user rank based on wins and volume
CREATE OR REPLACE FUNCTION update_user_ranks()
RETURNS void AS $$
BEGIN
    WITH ranked_users AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY total_wins DESC, total_volume DESC, created_at ASC
            ) as new_rank
        FROM user_profiles
    )
    UPDATE user_profiles 
    SET rank = ranked_users.new_rank
    FROM ranked_users
    WHERE user_profiles.id = ranked_users.id;
END;
$$ language 'plpgsql';

-- You can run this function periodically to update ranks
-- SELECT update_user_ranks();
