'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useAuth();

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

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending || isConnecting}
      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
    >
      {(isPending || isConnecting) && <Loader2 className="w-4 h-4 animate-spin" />}
      Connect Wallet
    </button>
  );
}
