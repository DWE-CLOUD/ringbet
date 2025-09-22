'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useAuth();
  const [showConnectors, setShowConnectors] = useState(false);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Filter out Farcaster connector for regular web browsers
  const availableConnectors = connectors.filter(connector => {
    // In Farcaster environment, show all connectors
    if (typeof window !== 'undefined' && window.parent !== window) {
      return true;
    }
    // In regular browsers, exclude Farcaster connector
    return connector.id !== 'farcasterMiniApp';
  });

  if (showConnectors && availableConnectors.length > 1) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center mb-4">Choose Wallet</h3>
        {availableConnectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => {
              connect({ connector });
              setShowConnectors(false);
            }}
            disabled={isPending || isConnecting}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            <span>{connector.name}</span>
            {(isPending || isConnecting) && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </button>
        ))}
        <button
          onClick={() => setShowConnectors(false)}
          className="w-full text-gray-400 hover:text-white text-sm py-2"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (availableConnectors.length === 1) {
          connect({ connector: availableConnectors[0] });
        } else {
          setShowConnectors(true);
        }
      }}
      disabled={isPending || isConnecting}
      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-green-500/25 transition-all"
    >
      {(isPending || isConnecting) && <Loader2 className="w-5 h-5 animate-spin" />}
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
}
