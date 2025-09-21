"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface User {
  fid?: number;
  username: string;
  displayName: string;
  avatar: string;
  address: string;
  balance: bigint;
  totalWinnings: number;
  gamesPlayed: number;
  winRate: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
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
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);

  useEffect(() => {
    // Skip initialization during server-side rendering or build time
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // Check if we're in a Farcaster environment
        const inFarcaster = window.parent !== window && 
          window.location !== window.parent.location;
        
        setIsFarcasterEnvironment(inFarcaster);

        if (inFarcaster) {
          // Try to use Farcaster SDK
          try {
            const { sdk } = await import('@farcaster/miniapp-sdk');
            const response = await sdk.quickAuth.fetch('/api/auth');
            
            if (response.ok) {
              const userData = await response.json();
              
              setUser({
                fid: userData.fid,
                username: userData.username || `user-${userData.fid}`,
                displayName: userData.displayName || userData.username,
                avatar: userData.pfpUrl || '',
                address: address || '',
                balance: BigInt(0),
                totalWinnings: 0,
                gamesPlayed: 0,
                winRate: 0,
              });
              
              // Ready signal to Farcaster
              sdk.actions.ready();
            }
          } catch (error) {
            console.log('Farcaster SDK not available, using regular wallet connection');
          }
        }

        // If not in Farcaster or Farcaster auth failed, use wallet connection
        if (!inFarcaster || !user) {
          if (isConnected && address) {
            setUser({
              username: `${address.slice(0, 6)}...${address.slice(-4)}`,
              displayName: 'Wallet User',
              avatar: '',
              address: address,
              balance: BigInt(0),
              totalWinnings: 0,
              gamesPlayed: 0,
              winRate: 0,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isConnected, address]);

  const connect = async () => {
    try {
      if (!isConnected && connectors.length > 0) {
        wagmiConnect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
    setUser(null);
  };

  const updateStats = (winnings: number, isWin: boolean) => {
    if (user) {
      setUser({
        ...user,
        totalWinnings: user.totalWinnings + winnings,
        gamesPlayed: user.gamesPlayed + 1,
        winRate: isWin 
          ? ((user.gamesPlayed * user.winRate + 100) / (user.gamesPlayed + 1)) 
          : ((user.gamesPlayed * user.winRate) / (user.gamesPlayed + 1)),
      });
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    connect,
    disconnect,
    updateStats,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};