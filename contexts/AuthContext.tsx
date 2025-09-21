"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  totalWinnings: number;
  gamesPlayed: number;
  winRate: number;
  joinedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => void;
  disconnect: () => void;
  updateBalance: (newBalance: number) => void;
  updateStats: (winnings: number, isWin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const savedUser = localStorage.getItem('ringbet_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking saved user:', error);
      }
      setIsLoading(false);
    };

    // Simulate initial loading
    setTimeout(checkConnection, 2000);
  }, []);

  const login = (username: string) => {
    const userId = Date.now().toString();
      
    // Create user profile
    const newUser: User = {
      id: userId,
      username,
      avatar: username.slice(0, 2).toUpperCase(),
      balance: 5000, // Starting balance
      totalWinnings: 0,
      gamesPlayed: 0,
      winRate: 0,
      joinedAt: new Date(),
    };

    setUser(newUser);
    localStorage.setItem('ringbet_user', JSON.stringify(newUser));
  };

  const disconnect = () => {
    setUser(null);
    localStorage.removeItem('ringbet_user');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('ringbet_user', JSON.stringify(updatedUser));
    }
  };

  const updateStats = (winnings: number, isWin: boolean) => {
    if (user) {
      const updatedUser = {
        ...user,
        totalWinnings: user.totalWinnings + winnings,
        gamesPlayed: user.gamesPlayed + 1,
        winRate: isWin ? ((user.gamesPlayed * user.winRate + 100) / (user.gamesPlayed + 1)) : ((user.gamesPlayed * user.winRate) / (user.gamesPlayed + 1)),
      };
      setUser(updatedUser);
      localStorage.setItem('ringbet_user', JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    disconnect,
    updateBalance,
    updateStats,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};