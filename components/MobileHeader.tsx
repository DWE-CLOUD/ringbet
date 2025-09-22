'use client';

import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';

export default function MobileHeader() {
  const { address, isConnected } = useAccount();

  return (
    <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 md:hidden">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="text-white font-bold text-lg">RingBet</span>
        </div>

        {/* Wallet Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">
                {address?.slice(0, 4)}...{address?.slice(-4)}
              </span>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-full px-3 py-1 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Not Connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
